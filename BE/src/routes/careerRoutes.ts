import { Router } from 'express';
import { getCareerById, listCareers } from '../controllers/careerController';

const router = Router();

router.get('/', listCareers);
router.get('/:careerId', getCareerById);

export default router;
