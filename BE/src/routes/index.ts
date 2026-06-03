import { Router } from 'express';
import authRoutes from './authRoutes';
import careerRoutes from './careerRoutes';
import healthRoutes from './healthRoutes';
import mentorRoutes from './mentorRoutes';
import roadmapRoutes from './roadmapRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/careers', careerRoutes);
router.use('/mentors', mentorRoutes);
router.use('/roadmap', roadmapRoutes);

export default router;
