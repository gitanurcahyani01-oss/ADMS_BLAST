import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  revokeAdmin,
  updateStatus,
  updateRole,
  deleteUser,
} from '../controllers/adminController.js';
import { verifyToken, requireRole, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all admin routes
router.use(verifyToken);

// Accessible by Super Admin (Global) and Admin (Workspace Scoped)
router.get('/users', requireRole('SUPER_ADMIN', 'ADMIN'), getAllUsers);
router.post('/users', requireRole('SUPER_ADMIN', 'ADMIN'), createUser);
router.patch('/users/:id/status', requireRole('SUPER_ADMIN', 'ADMIN'), updateStatus);
router.delete('/users/:id', requireRole('SUPER_ADMIN', 'ADMIN'), deleteUser);

// Super Admin EXCLUSIVE routes
router.patch('/users/:id/revoke', requireSuperAdmin, revokeAdmin);
router.patch('/users/:id/role', requireSuperAdmin, updateRole);

export default router;
