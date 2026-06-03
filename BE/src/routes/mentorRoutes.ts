import { Router } from 'express';
import {
  createMentor,
  getMentorById,
  listMentors,
  updateMentor,
} from '../controllers/mentorController';
import { requireAuth } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/errors';

const router = Router();

router.get('/', asyncHandler(listMentors));
router.post('/', requireAuth, asyncHandler(createMentor));
router.get('/:mentorId', asyncHandler(getMentorById));
router.put('/:mentorId', requireAuth, asyncHandler(updateMentor));

export default router;
