import { Router } from 'express';
import { createTestAttemptHandler } from '../controllers/assessmentController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/:testId/start', requireAuth, createTestAttemptHandler);

export default router;
