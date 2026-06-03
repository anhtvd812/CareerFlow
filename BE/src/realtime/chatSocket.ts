import { createHash } from 'crypto';
import type { IncomingMessage, Server } from 'http';
import type { Socket } from 'net';
import jwt from 'jsonwebtoken';
import {
  createMessageInRoom,
  ensureRoomAccess,
  listUserRoomIds,
} from '../services/chatService';
import { parseAuthUser, type AuthUser } from '../utils/auth';
import { getEnv } from '../utils/env';
import { AppError } from '../utils/errors';
import { parseMessageInput } from '../utils/validation';

const WS_PATH = '/ws/chat';
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_FRAME_BYTES = 64 * 1024;

type ChatClient = {
  id: string;
  socket: Socket;
  user: AuthUser;
  rooms: Set<string>;
  buffer: Buffer;
};

type ClientEvent = {
  type?: string;
  eventId?: string;
  roomId?: string;
  isTyping?: boolean;
  content?: string;
  attachment?: unknown;
};

const clientsByUser = new Map<string, Set<ChatClient>>();
const clientsByRoom = new Map<string, Set<ChatClient>>();

const addToSetMap = <T>(map: Map<string, Set<T>>, key: string, value: T) => {
  const set = map.get(key) || new Set<T>();
  set.add(value);
  map.set(key, set);
};

const removeFromSetMap = <T>(map: Map<string, Set<T>>, key: string, value: T) => {
  const set = map.get(key);
  if (!set) {
    return;
  }

  set.delete(value);
  if (!set.size) {
    map.delete(key);
  }
};

const createAcceptKey = (clientKey: string) =>
  createHash('sha1')
    .update(`${clientKey}${WS_GUID}`)
    .digest('base64');

const rejectUpgrade = (socket: Socket, statusCode: number, message: string) => {
  socket.write(`HTTP/1.1 ${statusCode} ${message}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
};

const sendRaw = (socket: Socket, payload: string, opcode = 0x1) => {
  if (socket.destroyed) {
    return;
  }

  const body = Buffer.from(payload);
  const length = body.length;
  let header: Buffer;

  if (length < 126) {
    header = Buffer.from([0x80 | opcode, length]);
  } else if (length <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  socket.write(Buffer.concat([header, body]));
};

const sendJson = (client: ChatClient, payload: Record<string, unknown>) => {
  sendRaw(client.socket, JSON.stringify(payload));
};

const sendError = (client: ChatClient, message: string, eventId?: string) => {
  sendJson(client, {
    type: 'error',
    eventId,
    message,
  });
};

const broadcastToRoom = (
  roomId: string,
  payload: Record<string, unknown>,
  exceptClient?: ChatClient,
) => {
  const clients = clientsByRoom.get(roomId);
  if (!clients) {
    return;
  }

  for (const client of clients) {
    if (client !== exceptClient) {
      sendJson(client, payload);
    }
  }
};

const broadcastPresence = (userId: string, isOnline: boolean, roomIds: Iterable<string>) => {
  for (const roomId of roomIds) {
    broadcastToRoom(roomId, {
      type: 'presence',
      userId,
      isOnline,
    });
  }
};

const addClientToRoom = (client: ChatClient, roomId: string) => {
  client.rooms.add(roomId);
  addToSetMap(clientsByRoom, roomId, client);
};

const removeClient = (client: ChatClient) => {
  const wasLastConnection = (clientsByUser.get(client.user.id)?.size || 0) <= 1;
  const roomIds = [...client.rooms];

  removeFromSetMap(clientsByUser, client.user.id, client);
  for (const roomId of roomIds) {
    removeFromSetMap(clientsByRoom, roomId, client);
  }

  client.rooms.clear();

  if (wasLastConnection) {
    broadcastPresence(client.user.id, false, roomIds);
  }
};

const parseFrames = (client: ChatClient, chunk: Buffer) => {
  client.buffer = Buffer.concat([client.buffer, chunk]);
  const messages: string[] = [];

  while (client.buffer.length >= 2) {
    const firstByte = client.buffer[0];
    const secondByte = client.buffer[1];
    const opcode = firstByte & 0x0f;
    const isMasked = Boolean(secondByte & 0x80);
    let payloadLength = secondByte & 0x7f;
    let offset = 2;

    if (payloadLength === 126) {
      if (client.buffer.length < offset + 2) {
        break;
      }

      payloadLength = client.buffer.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      if (client.buffer.length < offset + 8) {
        break;
      }

      const longLength = client.buffer.readBigUInt64BE(offset);
      if (longLength > BigInt(MAX_FRAME_BYTES)) {
        throw new AppError(1009, 'WebSocket frame is too large.');
      }

      payloadLength = Number(longLength);
      offset += 8;
    }

    if (payloadLength > MAX_FRAME_BYTES) {
      throw new AppError(1009, 'WebSocket frame is too large.');
    }

    if (!isMasked) {
      throw new AppError(1002, 'Client WebSocket frames must be masked.');
    }

    if (client.buffer.length < offset + 4 + payloadLength) {
      break;
    }

    const mask = client.buffer.subarray(offset, offset + 4);
    offset += 4;
    const payload = Buffer.from(client.buffer.subarray(offset, offset + payloadLength));
    client.buffer = client.buffer.subarray(offset + payloadLength);

    for (let index = 0; index < payload.length; index += 1) {
      payload[index] ^= mask[index % 4];
    }

    if (opcode === 0x8) {
      client.socket.end();
      return messages;
    }

    if (opcode === 0x9) {
      sendRaw(client.socket, payload.toString('utf8'), 0xA);
      continue;
    }

    if (opcode !== 0x1) {
      continue;
    }

    messages.push(payload.toString('utf8'));
  }

  return messages;
};

const handleEvent = async (client: ChatClient, event: ClientEvent) => {
  if (!event.type) {
    throw new AppError(400, 'Event type is required.');
  }

  if (event.type === 'join_room') {
    if (!event.roomId) {
      throw new AppError(400, 'roomId is required.');
    }

    await ensureRoomAccess(event.roomId, client.user.id);
    addClientToRoom(client, event.roomId);
    sendJson(client, {
      type: 'joined_room',
      eventId: event.eventId,
      roomId: event.roomId,
    });
    return;
  }

  if (event.type === 'typing') {
    if (!event.roomId) {
      throw new AppError(400, 'roomId is required.');
    }

    await ensureRoomAccess(event.roomId, client.user.id);
    addClientToRoom(client, event.roomId);
    broadcastToRoom(
      event.roomId,
      {
        type: 'typing',
        roomId: event.roomId,
        userId: client.user.id,
        isTyping: Boolean(event.isTyping),
      },
      client,
    );
    return;
  }

  if (event.type === 'send_message') {
    if (!event.roomId) {
      throw new AppError(400, 'roomId is required.');
    }

    const messageInput = parseMessageInput({
      content: event.content,
      attachment: event.attachment,
    });
    const message = await createMessageInRoom(event.roomId, client.user.id, messageInput);
    addClientToRoom(client, event.roomId);
    broadcastToRoom(event.roomId, {
      type: 'message',
      eventId: event.eventId,
      data: message,
    });
    return;
  }

  if (event.type === 'ping') {
    sendJson(client, { type: 'pong', eventId: event.eventId });
    return;
  }

  throw new AppError(400, 'Unsupported WebSocket event type.');
};

const parseClientEvent = (raw: string): ClientEvent => {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid event.');
    }

    return parsed as ClientEvent;
  } catch (_error) {
    throw new AppError(400, 'WebSocket event must be valid JSON.');
  }
};

const authenticateUpgrade = (req: IncomingMessage) => {
  const url = new URL(req.url || '', 'http://localhost');
  const token = url.searchParams.get('token');

  if (!token) {
    throw new AppError(401, 'Missing authentication token.');
  }

  const decoded = jwt.verify(token, getEnv('JWT_SECRET', 'change_me'));
  return parseAuthUser(decoded);
};

const handleConnection = async (req: IncomingMessage, socket: Socket) => {
  let user: AuthUser;

  try {
    user = authenticateUpgrade(req);
  } catch (_error) {
    rejectUpgrade(socket, 401, 'Unauthorized');
    return;
  }

  const socketKey = req.headers['sec-websocket-key'];
  if (typeof socketKey !== 'string') {
    rejectUpgrade(socket, 400, 'Bad Request');
    return;
  }

  const roomIds = await listUserRoomIds(user.id);

  socket.write(
    [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${createAcceptKey(socketKey)}`,
      '\r\n',
    ].join('\r\n'),
  );

  const client: ChatClient = {
    id: `${user.id}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    socket,
    user,
    rooms: new Set<string>(),
    buffer: Buffer.alloc(0),
  };

  addToSetMap(clientsByUser, user.id, client);

  for (const roomId of roomIds) {
    addClientToRoom(client, roomId);
  }

  sendJson(client, {
    type: 'ready',
    userId: user.id,
    rooms: roomIds,
  });
  broadcastPresence(user.id, true, roomIds);

  socket.on('data', (chunk) => {
    try {
      const messages = parseFrames(client, chunk);
      for (const rawMessage of messages) {
        const event = parseClientEvent(rawMessage);
        handleEvent(client, event).catch((error: Error) => {
          sendError(client, error.message, event.eventId);
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WebSocket error.';
      sendError(client, message);
      socket.end();
    }
  });

  socket.on('close', () => removeClient(client));
  socket.on('error', () => removeClient(client));
};

export const initializeChatRealtime = (server: Server) => {
  server.on('upgrade', (req, socket) => {
    const url = new URL(req.url || '', 'http://localhost');
    if (url.pathname !== WS_PATH) {
      rejectUpgrade(socket, 404, 'Not Found');
      return;
    }

    handleConnection(req, socket).catch(() => {
      rejectUpgrade(socket, 500, 'Internal Server Error');
    });
  });
};
