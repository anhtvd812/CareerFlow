import { Router } from 'express';
import authRoutes from './authRoutes';
import assessmentRoutes from './assessmentRoutes';
import careerRoutes from './careerRoutes';
import healthRoutes from './healthRoutes';
import mentorRoutes from './mentorRoutes';
import recommendationRoutes from './recommendationRoutes';
import testRoutes from './testRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/careers', careerRoutes);
router.use('/mentors', mentorRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/tests', testRoutes);
router.use('/users', userRoutes);

export default router;
