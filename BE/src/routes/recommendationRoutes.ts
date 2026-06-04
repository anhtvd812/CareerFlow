import { Router } from 'express';
import { recommendRoadmapHandler } from '../controllers/recommendationController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/roadmap', requireAuth, recommendRoadmapHandler);

export default router;
