import { Router } from 'express';
import {
  getDashboardStats,
  getPerformanceAnalytics,
  getSuppliers,
  createSupplier,
  getShippingRules,
  updateShippingRules,
} from '../controllers/adminController';
import { authenticate, requireAdmin, requirePermission } from '../middlewares/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard/stats', requirePermission('analytics:view'), getDashboardStats);
router.get('/dashboard/analytics', requirePermission('analytics:view'), getPerformanceAnalytics);
router.get('/suppliers', requirePermission('suppliers:manage'), getSuppliers);
router.post('/suppliers', requirePermission('suppliers:manage'), createSupplier);
router.get('/shipping', requirePermission('shipping:manage'), getShippingRules);
router.put('/shipping', requirePermission('shipping:manage'), updateShippingRules);

export default router;
