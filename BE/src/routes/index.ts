import { Router } from 'express';
import authRoutes from './authRoutes';
import careerRoutes from './careerRoutes';
import chatRoutes from './chatRoutes';
import healthRoutes from './healthRoutes';
import mentorRoutes from './mentorRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/careers', careerRoutes);
router.use('/mentors', mentorRoutes);
router.use('/chat', chatRoutes);

export default router;
