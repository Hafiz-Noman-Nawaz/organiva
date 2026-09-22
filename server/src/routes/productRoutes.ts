import { Router } from 'express';
import {
  getProducts,
  getHeroProduct,
  getProductBySlug,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductReviews,
  submitProductReview,
} from '../controllers/productController';
import { authenticate, requireAdmin } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/hero', getHeroProduct);
router.get('/slug/:slug', getProductBySlug);
router.get('/:idOrSlug/reviews', getProductReviews);
router.post('/:idOrSlug/reviews', submitProductReview);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, getAdminProducts);
router.post('/admin', authenticate, requireAdmin, createProduct);
router.put('/admin/:id', authenticate, requireAdmin, updateProduct);
router.delete('/admin/:id', authenticate, requireAdmin, deleteProduct);

export default router;
