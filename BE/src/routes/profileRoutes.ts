import { Router } from 'express';
import {
  addCertificationHandler,
  deleteCertificationHandler,
  getProfileHandler,
  listCertificationsHandler,
  updateProfileHandler,
  updateSkillsHandler,
} from '../controllers/profileController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', requireAuth, getProfileHandler);
router.patch('/me', requireAuth, updateProfileHandler);
router.put('/me/skills', requireAuth, updateSkillsHandler);
router.get('/me/certifications', requireAuth, listCertificationsHandler);
router.post('/me/certifications', requireAuth, addCertificationHandler);
router.delete('/me/certifications/:id', requireAuth, deleteCertificationHandler);

export default router;
