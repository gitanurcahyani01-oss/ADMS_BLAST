import express from 'express';
import { login, register, getMe, switchWorkspace, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', verifyToken, getMe);
router.post('/switch-workspace', verifyToken, switchWorkspace);
router.post('/logout', verifyToken, logout);

export default router;
