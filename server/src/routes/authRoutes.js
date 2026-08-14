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

// Diagnostic route
router.get('/db-debug', (req, res) => {
  res.json({
    env: {
      DATABASE_URL_exists: !!process.env.DATABASE_URL,
      DATABASE_URL_value: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^@:]+)@/, ':***@') : null,
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_PASSWORD_exists: !!process.env.DB_PASSWORD,
    }
  });
});

export default router;
