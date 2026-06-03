import type { Request, Response } from 'express';
import {
  createMessageInRoom,
  listMessagesForRoom,
  listRoomsForUser,
} from '../services/chatService';
import { getAuthUser } from '../utils/auth';
import { parseMessageInput, parsePagination } from '../utils/validation';

export const listChatRooms = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const pagination = parsePagination(req.query, 20, 50);
  const result = await listRoomsForUser(authUser.id, pagination);

  res.json(result);
};

export const getChatHistory = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const pagination = parsePagination(req.query, 30, 100);
  const result = await listMessagesForRoom(req.params.roomId, authUser.id, pagination);

  res.json(result);
};

export const sendChatMessage = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const body =
    req.body && typeof req.body === 'object' && !Array.isArray(req.body)
      ? (req.body as Record<string, unknown>)
      : {};
  const input = parseMessageInput(body);
  const message = await createMessageInRoom(req.params.roomId, authUser.id, input);

  res.status(201).json({ data: message });
};
