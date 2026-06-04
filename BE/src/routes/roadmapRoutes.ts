import { Router } from 'express';
import { getRoadmap, getRoadmapProgress, updateRoadmapTask } from '../controllers/roadmapController';

const router = Router();

router.get('/', getRoadmap);
router.get('/progress', getRoadmapProgress);
router.patch('/tasks/:id', updateRoadmapTask);

export default router;
