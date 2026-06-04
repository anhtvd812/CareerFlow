import { chatMessages, mentors } from '../data/mockData';
import { clone, delay } from '../utils/mockApi';
import { request } from './apiClient';

let mentorStore = clone(mentors);
let messageStore = clone(chatMessages);
let roomStore = [];

const toUiMentor = (mentor) => ({
  id: mentor.id,
  name: mentor.user?.name || mentor.name || 'Mentor',
  role: mentor.headline || mentor.primarySpecialty || mentor.role || 'Learning Mentor',
  online: mentor.isAvailable ?? mentor.online ?? false,
});

const toUiMessage = (message) => ({
  id: message.id,
  sender: message.sender === 'STUDENT' || message.senderRole === 'STUDENT' || message.sender === 'user' ? 'user' : 'mentor',
  text: message.content || message.text || '',
});

export async function getMentors() {
  try {
    const payload = await request('/mentors');
    mentorStore = (payload.data || payload.mentors || []).map(toUiMentor);
    return clone(mentorStore);
  } catch (_error) {
    await delay();
    return clone(mentorStore);
  }
}

export async function getMentorById(mentorId) {
  try {
    const payload = await request(`/mentors/${mentorId}`);
    return toUiMentor(payload.data || payload);
  } catch (_error) {
    await delay(250);
    return clone(mentorStore.find((mentor) => mentor.id === mentorId));
  }
}

const loadRooms = async () => {
  const payload = await request('/chat/rooms');
  roomStore = payload.data || payload.rooms || [];
  return roomStore;
};

const findRoomForMentor = async (mentorId) => {
  const rooms = roomStore.length ? roomStore : await loadRooms();
  return rooms.find((room) => room.mentorId === mentorId || room.mentor?.id === mentorId || room.id === mentorId);
};

export async function getChatMessages(chatId) {
  try {
    const room = await findRoomForMentor(chatId);
    if (!room) {
      throw new Error('Chat room not found.');
    }
    const payload = await request(`/chat/rooms/${room.id}/messages`);
    messageStore[chatId] = (payload.data || payload.messages || []).map(toUiMessage);
    return clone(messageStore[chatId]);
  } catch (_error) {
    await delay();
    return clone(messageStore[chatId] || []);
  }
}

export async function sendMessage(chatId, message) {
  try {
    const room = await findRoomForMentor(chatId);
    if (!room) {
      throw new Error('Chat room not found.');
    }
    const response = await request(`/chat/rooms/${room.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: message }),
    });
    const sent = toUiMessage(response.data || response.message || response);
    messageStore[chatId] = [...(messageStore[chatId] || []), sent];
    return getChatMessages(chatId);
  } catch (_error) {
    await delay(250);
    const userMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: message,
    };
    const mentorReply = {
      id: `reply_${Date.now()}`,
      sender: 'mentor',
      text: buildMentorReply(message),
    };
    messageStore[chatId] = [...(messageStore[chatId] || []), userMessage, mentorReply];
    return clone(messageStore[chatId]);
  }
}

function buildMentorReply(message) {
  const normalized = message.toLowerCase();
  if (normalized.includes('yáº¿u')) {
    return 'Ky nang can uu tien la ReactJS, API Integration va Git. Em nen hoc theo project nho de tang toc.';
  }
  if (normalized.includes('project')) {
    return 'Mot project phu hop la Weather App dung React, Fetch API, loading state va xu ly loi co ban.';
  }
  return 'Buoc tiep theo nen la hoan thanh DOM Manipulation, sau do chuyen sang React Components va Props/State.';
}
