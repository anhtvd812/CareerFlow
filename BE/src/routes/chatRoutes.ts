import { Router } from 'express';
import {
  getChatHistory,
  listChatRooms,
  sendChatMessage,
} from '../controllers/chatController';
import { requireAuth } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/errors';

const router = Router();

router.use(requireAuth);
router.get('/rooms', asyncHandler(listChatRooms));
router.get('/rooms/:roomId/messages', asyncHandler(getChatHistory));
router.post('/rooms/:roomId/messages', asyncHandler(sendChatMessage));

export default router;
