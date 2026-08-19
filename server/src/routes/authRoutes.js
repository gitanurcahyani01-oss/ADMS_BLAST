import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, getMe, switchWorkspace, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Strict Rate Limiter for Auth endpoints (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login/register dari IP ini. Silakan coba lagi setelah 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);

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
