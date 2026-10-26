import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Wishlist, IWishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import mongoose from 'mongoose';

const getOrCreateWishlist = async (
  userId?: string,
  guestSessionId?: string
): Promise<IWishlist> => {
  let wishlist: IWishlist | null = null;

  if (userId) {
    wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, productIds: [] });
    }
  } else if (guestSessionId) {
    wishlist = await Wishlist.findOne({ guestSessionId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ guestSessionId, productIds: [] });
    }
  } else {
    throw new Error('User identity or guest session ID required.');
  }

  return wishlist;
};

export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?._id?.toString();
  const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);

  const wishlist = await getOrCreateWishlist(userId, guestSessionId);
  await wishlist.populate({
    path: 'productIds',
    match: { isPublished: true },
    select: 'name slug images basePricePaise ratingAverage ratingCount categoryId',
    populate: { path: 'categoryId', select: 'name slug' },
  });

  res.status(200).json({
    success: true,
    wishlist: {
      _id: wishlist._id,
      products: wishlist.productIds,
      count: wishlist.productIds.length,
    },
  });
};

export const toggleWishlistItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const userId = req.user?._id?.toString();
  const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ success: false, message: 'Invalid product ID' });
    return;
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  const wishlist = await getOrCreateWishlist(userId, guestSessionId);
  const exists = wishlist.productIds.some((id) => id.toString() === productId);

  if (exists) {
    wishlist.productIds = wishlist.productIds.filter((id) => id.toString() !== productId);
    await wishlist.save();
    res.status(200).json({
      success: true,
      action: 'removed',
      message: `Removed "${product.name}" from wishlist.`,
      inWishlist: false,
    });
  } else {
    wishlist.productIds.push(new mongoose.Types.ObjectId(productId));
    await wishlist.save();
    res.status(200).json({
      success: true,
      action: 'added',
      message: `Added "${product.name}" to wishlist.`,
      inWishlist: true,
    });
  }
};
