import { Router } from 'express';
import { getRoadmapProgress } from '../controllers/roadmapController';

const router = Router();

router.get('/progress', getRoadmapProgress);

export default router;
