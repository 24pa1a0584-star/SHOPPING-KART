import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { User } from '../models/User';
import { Coupon } from '../models/Coupon';
import { Review } from '../models/Review';
import { StoreSettings } from '../models/StoreSettings';
import { InventoryMovement } from '../models/InventoryMovement';
import { AuditLog } from '../models/AuditLog';
import { InventoryService } from '../services/inventoryService';
import {
  createProductSchema,
  createVariantSchema,
  createCouponSchema,
} from '../validators/schemas';

// Dashboard analytics from live MongoDB data
export const getDashboardAnalytics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const [
    totalOrders,
    paidOrdersAggregate,
    totalProducts,
    totalUsers,
    lowStockVariants,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { 'payment.status': 'PAID' } },
      { $group: { _id: null, totalRevenuePaise: { $sum: '$pricing.totalPaise' } } },
    ]),
    Product.countDocuments({ isPublished: true }),
    User.countDocuments({ role: 'customer' }),
    ProductVariant.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    })
      .populate('productId', 'name slug')
      .limit(10)
      .lean(),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('orderReference customerName pricing.totalPaise payment.status fulfillment.status createdAt')
      .lean(),
    Order.aggregate([
      { $group: { _id: '$fulfillment.status', count: { $sum: 1 } } },
    ]),
  ]);

  const totalRevenuePaise =
    paidOrdersAggregate.length > 0 ? paidOrdersAggregate[0].totalRevenuePaise : 0;

  // Build daily sales trend for the past 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const salesTrend = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        'payment.status': 'PAID',
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenuePaise: { $sum: '$pricing.totalPaise' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      totalOrders,
      totalRevenuePaise,
      totalProducts,
      totalUsers,
      lowStockCount: lowStockVariants.length,
      lowStockVariants,
      recentOrders,
      ordersByStatus: ordersByStatus.reduce((acc: any, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {}),
      salesTrend: salesTrend.map((s) => ({
        date: s._id,
        revenue: Math.round(s.revenuePaise / 100),
        orders: s.orderCount,
      })),
    },
  });
};

// Product management
export const adminListProducts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const products = await Product.find()
    .populate('categoryId', 'name slug')
    .sort({ createdAt: -1 })
    .lean();

  const productIds = products.map((p) => p._id);
  const variants = await ProductVariant.find({ productId: { $in: productIds } }).lean();

  const variantMap = new Map<string, any[]>();
  variants.forEach((v) => {
    const pId = v.productId.toString();
    if (!variantMap.has(pId)) variantMap.set(pId, []);
    variantMap.get(pId)?.push(v);
  });

  const enriched = products.map((p) => {
    const pVars = variantMap.get(p._id.toString()) || [];
    return {
      ...p,
      variants: pVars,
      totalStock: pVars.reduce((sum, v) => sum + v.stock, 0),
    };
  });

  res.status(200).json({ success: true, products: enriched });
};

export const adminCreateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const validated = createProductSchema.parse(req.body);

  const baseSlug = validated.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  const product = await Product.create({
    ...validated,
    slug: uniqueSlug,
  });

  await AuditLog.create({
    adminId: req.user?._id,
    adminEmail: req.user?.email,
    action: 'CREATE_PRODUCT',
    entity: 'Product',
    entityId: product._id.toString(),
    details: { name: product.name, slug: product.slug },
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, message: 'Product created successfully', product });
};

export const adminUpdateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { productId } = req.params;
  const product = await Product.findByIdAndUpdate(productId, req.body, { new: true });
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  await AuditLog.create({
    adminId: req.user?._id,
    adminEmail: req.user?.email,
    action: 'UPDATE_PRODUCT',
    entity: 'Product',
    entityId: product._id.toString(),
    details: req.body,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: 'Product updated successfully', product });
};

export const adminCreateVariant = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const validated = createVariantSchema.parse(req.body);

  const existingSku = await ProductVariant.findOne({ sku: validated.sku.toUpperCase() });
  if (existingSku) {
    res.status(409).json({ success: false, message: `SKU "${validated.sku}" already exists.` });
    return;
  }

  const variant = await ProductVariant.create({
    ...validated,
    sku: validated.sku.toUpperCase(),
  });

  await InventoryMovement.create({
    variantId: variant._id,
    sku: variant.sku,
    type: 'RESTOCK',
    quantityChange: variant.stock,
    previousStock: 0,
    newStock: variant.stock,
    referenceId: req.user?.email,
    reason: 'Initial variant creation stock',
  });

  res.status(201).json({ success: true, message: 'Variant created successfully', variant });
};

export const adminAdjustStock = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { variantId } = req.params;
  const { stock, reason } = req.body;

  if (typeof stock !== 'number' || stock < 0) {
    res.status(400).json({ success: false, message: 'Stock must be a non-negative number.' });
    return;
  }

  try {
    const result = await InventoryService.adjustStock(
      variantId,
      stock,
      req.user?.email || 'admin',
      reason
    );
    res.status(200).json({
      success: true,
      message: `Stock for ${result.sku} updated to ${result.newStock}.`,
      result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Order management
export const adminListOrders = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { status, paymentStatus, page = '1', limit = '20' } = req.query;

  const query: any = {};
  if (status) query['fulfillment.status'] = status;
  if (paymentStatus) query['payment.status'] = paymentStatus;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
};

export const adminUpdateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { status, carrier, trackingId, note } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  const validStatuses = [
    'PLACED',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid fulfillment status.' });
    return;
  }

  order.fulfillment.status = status;
  if (carrier) order.fulfillment.carrier = carrier;
  if (trackingId) order.fulfillment.trackingId = trackingId;
  if (status === 'SHIPPED') order.fulfillment.shippedAt = new Date();
  if (status === 'DELIVERED') order.fulfillment.deliveredAt = new Date();

  order.timeline.push({
    status,
    timestamp: new Date(),
    note: note || `Status updated to ${status} by admin.`,
  });

  await order.save();

  await AuditLog.create({
    adminId: req.user?._id,
    adminEmail: req.user?.email,
    action: 'UPDATE_ORDER_STATUS',
    entity: 'Order',
    entityId: order._id.toString(),
    details: { orderReference: order.orderReference, newStatus: status, trackingId },
    ipAddress: req.ip,
  });

  res.status(200).json({
    success: true,
    message: `Order ${order.orderReference} updated to ${status}.`,
    order,
  });
};

// Coupons management
export const adminListCoupons = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, coupons });
};

export const adminCreateCoupon = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const validated = createCouponSchema.parse(req.body);
  const existing = await Coupon.findOne({ code: validated.code.toUpperCase() });
  if (existing) {
    res.status(409).json({ success: false, message: `Coupon "${validated.code}" already exists.` });
    return;
  }

  const coupon = await Coupon.create({
    ...validated,
    code: validated.code.toUpperCase(),
  });

  res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
};

// Settings
export const adminGetSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create({});
  }
  res.status(200).json({ success: true, settings });
};

export const adminUpdateSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  res.status(200).json({ success: true, message: 'Store settings updated', settings });
};
