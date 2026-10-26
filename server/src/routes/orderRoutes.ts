import { Router } from 'express';
import {
  listOwnOrders,
  getOrderDetails,
  cancelOrder,
} from '../controllers/orderController';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/my-orders', requireAuth, listOwnOrders);
router.get('/:identifier', optionalAuth, getOrderDetails);
router.post('/:orderId/cancel', optionalAuth, cancelOrder);

export default router;
