import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import wishlistRoutes from './wishlistRoutes';
import checkoutRoutes from './checkoutRoutes';
import orderRoutes from './orderRoutes';
import reviewRoutes from './reviewRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LUMORA E-Commerce API',
    database: dbStatus,
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

export default router;
