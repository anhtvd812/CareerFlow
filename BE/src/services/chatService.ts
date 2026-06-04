import type { Prisma } from '@prisma/client';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import prisma from '../prisma/client';
import { forbidden } from '../utils/errors';
import type { AttachmentInput, MessageInput, Pagination } from '../utils/validation';

const MIME_EXTENSIONS: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

const messageSelect = {
  id: true,
  roomId: true,
  senderId: true,
  type: true,
  content: true,
  attachmentUrl: true,
  attachmentFileName: true,
  attachmentMimeType: true,
  attachmentSize: true,
  createdAt: true,
  updatedAt: true,
  sender: {
    select: userSelect,
  },
} as const;

const roomSelect = {
  id: true,
  name: true,
  type: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  participants: {
    select: {
      userId: true,
      joinedAt: true,
      lastReadAt: true,
      user: {
        select: userSelect,
      },
    },
  },
  messages: {
    orderBy: { createdAt: 'desc' },
    take: 1,
    select: messageSelect,
  },
} as const;

type MessageRecord = Prisma.MessageGetPayload<{ select: typeof messageSelect }>;
type RoomRecord = Prisma.ChatRoomGetPayload<{ select: typeof roomSelect }>;

export const serializeMessage = (message: MessageRecord) => ({
  id: message.id,
  roomId: message.roomId,
  senderId: message.senderId,
  sender: message.sender,
  type: message.type,
  content: message.content,
  attachment:
    message.attachmentUrl &&
    message.attachmentFileName &&
    message.attachmentMimeType &&
    message.attachmentSize !== null
      ? {
          url: message.attachmentUrl,
          fileName: message.attachmentFileName,
          mimeType: message.attachmentMimeType,
          size: message.attachmentSize,
        }
      : null,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const serializeRoom = (room: RoomRecord) => ({
  id: room.id,
  name: room.name,
  type: room.type,
  createdById: room.createdById,
  createdAt: room.createdAt,
  updatedAt: room.updatedAt,
  participants: room.participants,
  lastMessage: room.messages[0] ? serializeMessage(room.messages[0]) : null,
});

const sanitizePathSegment = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '');

const persistAttachment = async (roomId: string, attachment?: AttachmentInput) => {
  if (!attachment) {
    return undefined;
  }

  if (!attachment.dataBase64) {
    return attachment;
  }

  const normalizedBase64 = attachment.dataBase64.includes(',')
    ? attachment.dataBase64.slice(attachment.dataBase64.indexOf(',') + 1)
    : attachment.dataBase64;
  const extension = MIME_EXTENSIONS[attachment.mimeType] || path.extname(attachment.fileName);
  const safeRoomId = sanitizePathSegment(roomId);
  const storedFileName = `${randomUUID()}${extension}`;
  const uploadDirectory = path.join(process.cwd(), 'uploads', 'chat', safeRoomId);
  const uploadPath = path.join(uploadDirectory, storedFileName);

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(uploadPath, Buffer.from(normalizedBase64, 'base64'));

  return {
    url: `/uploads/chat/${safeRoomId}/${storedFileName}`,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    size: attachment.size,
  };
};

export const ensureRoomAccess = async (roomId: string, userId: string) => {
  const participant = await prisma.chatRoomParticipant.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
    select: {
      id: true,
      roomId: true,
      userId: true,
    },
  });

  if (!participant) {
    throw forbidden('You do not have access to this chat room.');
  }

  return participant;
};

export const listUserRoomIds = async (userId: string) => {
  const participants = await prisma.chatRoomParticipant.findMany({
    where: { userId },
    select: { roomId: true },
  });

  return participants.map((participant) => participant.roomId);
};

export const listRoomsForUser = async (userId: string, pagination: Pagination) => {
  const where: Prisma.ChatRoomWhereInput = {
    participants: {
      some: {
        userId,
      },
    },
  };

  const [total, rooms] = await prisma.$transaction([
    prisma.chatRoom.count({ where }),
    prisma.chatRoom.findMany({
      where,
      select: roomSelect,
      orderBy: { updatedAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
  ]);

  return {
    data: rooms.map(serializeRoom),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
};

export const listMessagesForRoom = async (
  roomId: string,
  userId: string,
  pagination: Pagination,
) => {
  await ensureRoomAccess(roomId, userId);

  const where: Prisma.MessageWhereInput = { roomId };
  const [total, messages] = await prisma.$transaction([
    prisma.message.count({ where }),
    prisma.message.findMany({
      where,
      select: messageSelect,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.chatRoomParticipant.update({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    }),
  ]);

  return {
    data: messages.reverse().map(serializeMessage),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
};

export const createMessageInRoom = async (
  roomId: string,
  senderId: string,
  input: MessageInput,
) => {
  await ensureRoomAccess(roomId, senderId);
  const attachment = await persistAttachment(roomId, input.attachment);

  const created = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        roomId,
        senderId,
        type: input.type,
        content: input.content,
        attachmentUrl: attachment?.url,
        attachmentFileName: attachment?.fileName,
        attachmentMimeType: attachment?.mimeType,
        attachmentSize: attachment?.size,
      },
      select: messageSelect,
    });

    await tx.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
      select: { id: true },
    });

    return message;
  });

  return serializeMessage(created);
};
