import { chatMessages, mentors } from '../data/mockData';
import { clone, delay } from '../utils/mockApi';

let messageStore = clone(chatMessages);

export async function getMentors() {
  await delay();
  return clone(mentors);
}

export async function getMentorById(mentorId) {
  await delay(250);
  return clone(mentors.find((mentor) => mentor.id === mentorId));
}

export async function getChatMessages(chatId) {
  await delay();
  return clone(messageStore[chatId] || []);
}

export async function sendMessage(chatId, message) {
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

function buildMentorReply(message) {
  const normalized = message.toLowerCase();
  if (normalized.includes('yếu')) {
    return 'Kỹ năng cần ưu tiên là ReactJS, API Integration và Git. Em nên học theo project nhỏ để tăng tốc.';
  }
  if (normalized.includes('project')) {
    return 'Một project phù hợp là Weather App dùng React, Fetch API, loading state và xử lý lỗi cơ bản.';
  }
  return 'Bước tiếp theo nên là hoàn thành DOM Manipulation, sau đó chuyển sang React Components và Props/State.';
}
