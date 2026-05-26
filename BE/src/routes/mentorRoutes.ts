import { Router } from 'express';
import { getMentorById, listMentors } from '../controllers/mentorController';

const router = Router();

router.get('/', listMentors);
router.get('/:mentorId', getMentorById);

export default router;
