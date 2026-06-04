import { Router } from 'express';
import authRoutes from './authRoutes';
import assessmentRoutes from './assessmentRoutes';
import careerRoutes from './careerRoutes';
import chatRoutes from './chatRoutes';
import healthRoutes from './healthRoutes';
import mentorRoutes from './mentorRoutes';
import roadmapRoutes from './roadmapRoutes';

import recommendationRoutes from './recommendationRoutes';

import skillsRoutes from './skillsRoutes';
import profileRoutes from './profileRoutes';

import testRoutes from './testRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/careers', careerRoutes);
router.use('/mentors', mentorRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/skills', skillsRoutes);
router.use('/profile', profileRoutes);
router.use('/tests', testRoutes);
router.use('/users', userRoutes);

export default router;
