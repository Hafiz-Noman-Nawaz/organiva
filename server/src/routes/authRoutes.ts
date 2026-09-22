import { Router } from 'express';
import {
  checkSetupStatus,
  setupSuperAdmin,
  loginAdmin,
  getMe,
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
} from '../controllers/authController';
import { authenticate, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

// Public setup & login endpoints
router.get('/setup-status', checkSetupStatus);
router.post('/setup-superadmin', setupSuperAdmin);
router.post('/login', loginAdmin);
router.get('/me', authenticate, getMe);

// Super Admin Staff & RBAC Management
router.get('/staff', authenticate, requireSuperAdmin, getStaffUsers);
router.post('/staff', authenticate, requireSuperAdmin, createStaffUser);
router.put('/staff/:id', authenticate, requireSuperAdmin, updateStaffUser);
router.delete('/staff/:id', authenticate, requireSuperAdmin, deleteStaffUser);

export default router;
