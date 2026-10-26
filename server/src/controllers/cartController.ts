import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Cart, ICart } from '../models/Cart';
import { ProductVariant } from '../models/ProductVariant';
import { Product } from '../models/Product';
import { addToCartSchema, updateCartItemSchema } from '../validators/schemas';

// Helper to get or create a cart for user or guest
const getOrCreateCart = async (
  userId?: string,
  guestSessionId?: string
): Promise<ICart> => {
  let cart: ICart | null = null;

  if (userId) {
    cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
  } else if (guestSessionId) {
    cart = await Cart.findOne({ guestSessionId });
    if (!cart) {
      cart = await Cart.create({ guestSessionId, items: [] });
    }
  } else {
    throw new Error('Either user identity or guest session ID is required to manage cart.');
  }

  return cart;
};

// Helper to enrich raw cart items with live product variant data & authoritative pricing
const enrichCart = async (cart: ICart) => {
  const enrichedItems = [];
  let subtotalPaise = 0;
  let hasStockIssues = false;

  for (const item of cart.items) {
    const variant = await ProductVariant.findById(item.variantId);
    if (!variant || !variant.isActive) {
      continue;
    }

    const product = await Product.findById(item.productId);
    if (!product || !product.isPublished) {
      continue;
    }

    const isAvailable = variant.stock >= item.quantity;
    if (!isAvailable) {
      hasStockIssues = true;
    }

    const unitPricePaise = variant.pricePaise;
    const lineTotalPaise = unitPricePaise * item.quantity;
    subtotalPaise += lineTotalPaise;

    const primaryImage =
      variant.images && variant.images.length > 0
        ? variant.images[0]
        : product.images && product.images.length > 0
        ? product.images[0]
        : '';

    enrichedItems.push({
      _id: item._id,
      productId: product._id,
      variantId: variant._id,
      productName: product.name,
      productSlug: product.slug,
      variantTitle: variant.title,
      sku: variant.sku,
      options: variant.options,
      unitPricePaise,
      compareAtPricePaise: variant.compareAtPricePaise,
      quantity: item.quantity,
      lineTotalPaise,
      image: primaryImage,
      stock: variant.stock,
      isAvailable,
    });
  }

  return {
    _id: cart._id,
    userId: cart.userId,
    guestSessionId: cart.guestSessionId,
    items: enrichedItems,
    itemCount: enrichedItems.reduce((acc, item) => acc + item.quantity, 0),
    subtotalPaise,
    hasStockIssues,
    updatedAt: cart.updatedAt,
  };
};

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?._id?.toString();
  const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);

  const cart = await getOrCreateCart(userId, guestSessionId);
  const enriched = await enrichCart(cart);

  res.status(200).json({ success: true, cart: enriched });
};

export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validated = addToCartSchema.parse(req.body);
  const userId = req.user?._id?.toString();
  const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);

  // Validate variant and product exist and have stock
  const variant = await ProductVariant.findById(validated.variantId);
  if (!variant || !variant.isActive) {
    res.status(404).json({ success: false, message: 'Selected variant is unavailable.' });
    return;
  }

  const product = await Product.findById(validated.productId);
  if (!product || !product.isPublished) {
    res.status(404).json({ success: false, message: 'Product is no longer available.' });
    return;
  }

  const cart = await getOrCreateCart(userId, guestSessionId);

  const existingItemIndex = cart.items.findIndex(
    (item) => item.variantId.toString() === validated.variantId
  );

  const currentQty = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
  const newQty = currentQty + validated.quantity;

  if (newQty > variant.stock) {
    res.status(400).json({
      success: false,
      message: `Cannot add ${validated.quantity} more. Total requested (${newQty}) exceeds available stock (${variant.stock}).`,
    });
    return;
  }

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({
      productId: product._id,
      variantId: variant._id,
      quantity: validated.quantity,
      addedAt: new Date(),
    } as any);
  }

  cart.updatedAt = new Date();
  await cart.save();

  const enriched = await enrichCart(cart);
  res.status(200).json({
    success: true,
    message: `Added "${product.name} (${variant.title})" to cart.`,
    cart: enriched,
  });
};

export const updateQuantity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { variantId } = req.params;
  const validated = updateCartItemSchema.parse(req.body);
  const userId = req.user?._id?.toString();
  const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);

  const cart = await getOrCreateCart(userId, guestSessionId);
  const itemIndex = cart.items.findIndex((item) => item.variantId.toString() === variantId);

  if (itemIndex === -1) {
    res.status(404).json({ success: false, message: 'Item not found in cart.' });
    return;
  }

  if (validated.quantity <= 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Check available stock
    const variant = await ProductVariant.findById(variantId);
    if (!variant || !variant.isActive) {
      res.status(400).json({ success: false, message: 'Product variant is unavailable.' });
      return;
    }

    if (validated.quantity > variant.stock) {
      res.status(400).json({
        success: false,
        message: `Requested quantity (${validated.quantity}) exceeds available stock (${variant.stock}).`,
      });
      return;
    }

    cart.items[itemIndex].quantity = validated.quantity;
  }

  cart.updatedAt = new Date();
  await cart.save();

  const enriched = await enrichCart(cart);
  res.status(200).json({ success: true, message: 'Cart updated.', cart: enriched });
};

export const removeItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { variantId } = req.params;
  const userId = req.user?._id?.toString();
  const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);

  const cart = await getOrCreateCart(userId, guestSessionId);
  cart.items = cart.items.filter((item) => item.variantId.toString() !== variantId);

  cart.updatedAt = new Date();
  await cart.save();

  const enriched = await enrichCart(cart);
  res.status(200).json({ success: true, message: 'Item removed from cart.', cart: enriched });
};

export const clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?._id?.toString();
  const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);

  const cart = await getOrCreateCart(userId, guestSessionId);
  cart.items = [];
  cart.updatedAt = new Date();
  await cart.save();

  res.status(200).json({ success: true, message: 'Cart cleared.', cart: await enrichCart(cart) });
};

export const mergeGuestCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required to merge cart.' });
    return;
  }

  const { guestSessionId } = req.body;
  if (!guestSessionId) {
    res.status(400).json({ success: false, message: 'Guest session ID is required.' });
    return;
  }

  const guestCart = await Cart.findOne({ guestSessionId });
  if (!guestCart || guestCart.items.length === 0) {
    const userCart = await getOrCreateCart(req.user._id.toString());
    res.status(200).json({ success: true, cart: await enrichCart(userCart) });
    return;
  }

  let userCart = await Cart.findOne({ userId: req.user._id });
  if (!userCart) {
    userCart = await Cart.create({ userId: req.user._id, items: [] });
  }

  // Merge items safely
  for (const guestItem of guestCart.items) {
    const variant = await ProductVariant.findById(guestItem.variantId);
    if (!variant || !variant.isActive || variant.stock <= 0) continue;

    const existingIndex = userCart.items.findIndex(
      (item) => item.variantId.toString() === guestItem.variantId.toString()
    );

    if (existingIndex > -1) {
      const combinedQty = userCart.items[existingIndex].quantity + guestItem.quantity;
      // Cap at stock availability
      userCart.items[existingIndex].quantity = Math.min(combinedQty, variant.stock);
    } else {
      userCart.items.push({
        productId: guestItem.productId,
        variantId: guestItem.variantId,
        quantity: Math.min(guestItem.quantity, variant.stock),
        addedAt: new Date(),
      } as any);
    }
  }

  userCart.updatedAt = new Date();
  await userCart.save();

  // Clean up guest cart
  await Cart.deleteOne({ _id: guestCart._id });

  const enriched = await enrichCart(userCart);
  res.status(200).json({
    success: true,
    message: 'Guest cart merged successfully.',
    cart: enriched,
  });
};
