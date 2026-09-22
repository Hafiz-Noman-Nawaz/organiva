import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getCategories);
router.post('/admin', authenticate, requireAdmin, createCategory);
router.put('/admin/:id', authenticate, requireAdmin, updateCategory);
router.delete('/admin/:id', authenticate, requireAdmin, deleteCategory);

export default router;
