import { Router } from 'express';
import { compareSkillsHandler } from '../controllers/skillsController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/compare', requireAuth, compareSkillsHandler);

export default router;
