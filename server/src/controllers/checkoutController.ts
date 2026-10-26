import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Cart } from '../models/Cart';
import { PricingService } from '../services/pricingService';
import { InventoryService } from '../services/inventoryService';
import { OrderService } from '../services/orderService';
import { PaymentService } from '../services/paymentService';
import { checkoutSchema } from '../validators/schemas';

export const calculateCheckoutQuote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?._id?.toString();
  const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);
  const { couponCode, shippingMethod = 'STANDARD' } = req.body;

  let cart = null;
  if (userId) {
    cart = await Cart.findOne({ userId });
  } else if (guestSessionId) {
    cart = await Cart.findOne({ guestSessionId });
  }

  if (!cart || cart.items.length === 0) {
    res.status(400).json({ success: false, message: 'Cart is empty.' });
    return;
  }

  const rawItems = cart.items.map((i) => ({
    productId: i.productId.toString(),
    variantId: i.variantId.toString(),
    quantity: i.quantity,
  }));

  try {
    const quote = await PricingService.calculateQuote(rawItems, couponCode, shippingMethod);
    res.status(200).json({ success: true, quote });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const placeOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const validated = checkoutSchema.parse(req.body);
  const userId = req.user?._id?.toString();
  const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);

  // Identify customer details
  let customerEmail = req.user?.email || validated.guestEmail;
  let customerName = req.user?.name || validated.guestName || validated.shippingAddress.name;
  let customerPhone = req.user?.phone || validated.guestPhone || validated.shippingAddress.phone;

  if (!customerEmail) {
    res.status(400).json({
      success: false,
      message: 'Email address is required for checkout.',
    });
    return;
  }

  // Retrieve cart
  let cart = null;
  if (userId) {
    cart = await Cart.findOne({ userId });
  } else if (guestSessionId) {
    cart = await Cart.findOne({ guestSessionId });
  }

  if (!cart || cart.items.length === 0) {
    res.status(400).json({ success: false, message: 'Your cart is empty. Please add items before placing an order.' });
    return;
  }

  const rawItems = cart.items.map((i) => ({
    productId: i.productId.toString(),
    variantId: i.variantId.toString(),
    quantity: i.quantity,
  }));

  // 1. Authoritatively calculate quotes & validate coupons from DB
  let quote;
  try {
    quote = await PricingService.calculateQuote(
      rawItems,
      validated.couponCode,
      validated.shippingMethod
    );
  } catch (pricingError: any) {
    res.status(400).json({ success: false, message: pricingError.message });
    return;
  }

  // 2. Generate unique order reference
  const orderReference = await OrderService.generateOrderReference();

  // 3. Atomically deduct stock
  // If concurrent checkout causes stock to become insufficient, this throws an error and rolls back!
  try {
    await InventoryService.deductStockAtomically(
      rawItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      orderReference
    );
  } catch (stockError: any) {
    res.status(409).json({
      success: false,
      message: `Stock reservation failed: ${stockError.message}`,
    });
    return;
  }

  // 4. Handle Payment processing
  let paymentStatus: 'PAID' | 'PENDING' = 'PAID';
  let transactionId: string | undefined = undefined;

  if (validated.paymentMethod === 'COD') {
    // COD is placed with PENDING payment status
    paymentStatus = 'PENDING';
    transactionId = `COD_COLLECT_ON_DELIVERY_${Date.now()}`;
  } else if (validated.paymentMethod === 'DEMO') {
    // Demo Mode simulates instant successful transaction
    paymentStatus = 'PAID';
    transactionId = PaymentService.generateDemoTransactionId();
  } else if (validated.paymentMethod === 'RAZORPAY') {
    // In demo environment, generate a verified test transaction
    paymentStatus = 'PAID';
    transactionId = `RZP_TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  // 5. Create persistent order with immutable snapshot
  try {
    const order = await OrderService.createOrder({
      orderReference,
      customerId: userId,
      customerName,
      customerEmail,
      customerPhone,
      quote,
      shippingAddress: validated.shippingAddress,
      paymentMethod: validated.paymentMethod,
      paymentStatus,
      transactionId,
    });

    // 6. Clear customer or guest cart after successful checkout
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: order._id,
        orderReference: order.orderReference,
        totalPaise: order.pricing.totalPaise,
        paymentStatus: order.payment.status,
        fulfillmentStatus: order.fulfillment.status,
        createdAt: order.createdAt,
      },
    });
  } catch (orderError: any) {
    // If order creation fails after stock deduction, compensate stock
    await InventoryService.restoreStock(
      rawItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      orderReference,
      'ROLLBACK_ORDER_PERSISTENCE_FAILURE'
    );
    res.status(500).json({
      success: false,
      message: 'Failed to record order. Stock reservation has been restored.',
    });
  }
};
