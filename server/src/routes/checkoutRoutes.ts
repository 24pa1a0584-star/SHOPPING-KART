import { Router } from 'express';
import { calculateCheckoutQuote, placeOrder } from '../controllers/checkoutController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.use(optionalAuth);

router.post('/quote', calculateCheckoutQuote);
router.post('/order', placeOrder);

export default router;
