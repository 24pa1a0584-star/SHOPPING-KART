import { Router } from 'express';
import { getWishlist, toggleWishlistItem } from '../controllers/wishlistController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.use(optionalAuth);

router.get('/', getWishlist);
router.post('/toggle/:productId', toggleWishlistItem);

export default router;
