import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
  mergeGuestCart,
} from '../controllers/cartController';
import { optionalAuth, requireAuth } from '../middleware/auth';

const router = Router();

router.use(optionalAuth);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:variantId', updateQuantity);
router.delete('/items/:variantId', removeItem);
router.delete('/', clearCart);
router.post('/merge', requireAuth, mergeGuestCart);

export default router;
