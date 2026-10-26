import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  getFeaturedProducts,
  listCategories,
  listBrands,
} from '../controllers/productController';

const router = Router();

router.get('/', listProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', listCategories);
router.get('/brands', listBrands);
router.get('/:slug', getProductBySlug);

export default router;
