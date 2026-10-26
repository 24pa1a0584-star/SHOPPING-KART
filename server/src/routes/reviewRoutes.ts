import { Router } from 'express';
import { listProductReviews, createReview } from '../controllers/reviewController';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/products/:productId', optionalAuth, listProductReviews);
router.post('/products/:productId', requireAuth, createReview);

export default router;
