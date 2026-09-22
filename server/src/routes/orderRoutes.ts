import { Router } from 'express';
import {
  createOrder,
  trackOrder,
  getOrderById,
  getAdminOrders,
  updateOrderStatus,
  getPublicShippingRule,
  applyCoupon,
} from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/shipping-rule', getPublicShippingRule);
router.post('/apply-coupon', applyCoupon);
router.post('/checkout', createOrder);
router.post('/track', trackOrder);
router.get('/:orderId', getOrderById);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, getAdminOrders);
router.put('/admin/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;
