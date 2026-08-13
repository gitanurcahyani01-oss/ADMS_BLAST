import express from 'express';
import {
  getAllPermissions,
  getAllRoles,
  getMyPermissions,
} from '../controllers/rbacController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Current user's permissions
router.get('/my-permissions', verifyToken, getMyPermissions);

// Super Admin / Admin roles & permission catalogs
router.get('/permissions', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), getAllPermissions);
router.get('/roles', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), getAllRoles);

export default router;
