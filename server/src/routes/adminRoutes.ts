import { Router } from 'express';
import {
  getDashboardAnalytics,
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminCreateVariant,
  adminAdjustStock,
  adminListOrders,
  adminUpdateOrderStatus,
  adminListCoupons,
  adminCreateCoupon,
  adminGetSettings,
  adminUpdateSettings,
} from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Strictly require authenticated admin for all endpoints in this router
router.use(requireAuth, requireRole('admin'));

// Analytics
router.get('/analytics', getDashboardAnalytics);

// Product & Variant Management
router.get('/products', adminListProducts);
router.post('/products', adminCreateProduct);
router.put('/products/:productId', adminUpdateProduct);
router.post('/variants', adminCreateVariant);
router.put('/variants/:variantId/stock', adminAdjustStock);

// Order Fulfillment
router.get('/orders', adminListOrders);
router.put('/orders/:orderId/status', adminUpdateOrderStatus);

// Coupons
router.get('/coupons', adminListCoupons);
router.post('/coupons', adminCreateCoupon);

// Settings
router.get('/settings', adminGetSettings);
router.put('/settings', adminUpdateSettings);

export default router;
