import { Router } from 'express';
import {
  createAttemptHandler,
  getAssessmentQuestionsHandler,
  getAssessmentResultHandler,
  listAssessmentsHandler,
  listAssessmentClassificationsHandler,
  saveAttemptHandler,
  submitAttemptHandler,
  submitAssessmentHandler,
} from '../controllers/assessmentController';
import { optionalAuth, requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/submit', optionalAuth, submitAssessmentHandler);
router.get('/', listAssessmentsHandler);
router.get('/:id/questions', getAssessmentQuestionsHandler);
router.post('/:id/attempts', requireAuth, createAttemptHandler);
router.patch('/attempts/:id', requireAuth, saveAttemptHandler);
router.post('/attempts/:id/submit', requireAuth, submitAttemptHandler);
router.get('/results/:id', getAssessmentResultHandler);
router.get('/classifications', listAssessmentClassificationsHandler);

export default router;
