import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { createReviewSchema } from '../validators/schemas';

export const listProductReviews = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { productId } = req.params;

  const reviews = await Review.find({ productId, isApproved: true })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, reviews });
};

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { productId } = req.params;
  const validated = createReviewSchema.parse(req.body);

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  // Check if user already reviewed
  const existing = await Review.findOne({ productId, userId: req.user._id });
  if (existing) {
    res.status(400).json({
      success: false,
      message: 'You have already submitted a review for this product.',
    });
    return;
  }

  // Check if user is a verified purchaser
  const hasPurchased = await Order.exists({
    customerId: req.user._id,
    'items.productId': product._id,
    'fulfillment.status': { $in: ['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PLACED'] },
  });

  const review = await Review.create({
    productId: product._id,
    userId: req.user._id,
    userName: req.user.name,
    rating: validated.rating,
    comment: validated.comment,
    isVerifiedPurchase: !!hasPurchased,
    isApproved: true,
  });

  // Recalculate average rating
  const allReviews = await Review.find({ productId: product._id, isApproved: true });
  const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
  product.ratingAverage = Number((total / allReviews.length).toFixed(1));
  product.ratingCount = allReviews.length;
  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully!',
    review,
  });
};
