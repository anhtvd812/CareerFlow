import { Router } from 'express';
import { listUserAssessmentHistoryHandler } from '../controllers/assessmentController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/:id/assessments', listUserAssessmentHistoryHandler);

export default router;
