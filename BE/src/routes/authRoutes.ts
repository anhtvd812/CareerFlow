import { Router } from 'express';
import { login, logout, register } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', requireAuth, logout);

export default router;
