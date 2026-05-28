import React, { useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import MentorList from '../components/MentorList';
import { getChatMessages, getMentors, sendMessage } from '../services/mentorApi';

export default function MentorChat() {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadMentors() {
      const nextMentors = await getMentors();
      setMentors(nextMentors);
      setSelectedMentor(nextMentors[0]);
      setMessages(await getChatMessages(nextMentors[0].id));
      setLoading(false);
    }
    loadMentors();
  }, []);

  async function handleSelectMentor(mentor) {
    setSelectedMentor(mentor);
    setMessages(await getChatMessages(mentor.id));
  }

  async function handleSend(event) {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setMessages(await sendMessage(selectedMentor.id, message.trim()));
    setMessage('');
    setSending(false);
  }

  async function handleQuickQuestion(question) {
    setMessage(question);
    setSending(true);
    setMessages(await sendMessage(selectedMentor.id, question));
    setMessage('');
    setSending(false);
  }

  if (loading) {
    return <div className="card p-8 text-center text-sm font-semibold text-slate-500">Đang tải mentor chat...</div>;
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Chat Mentor</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">Trao đổi cùng mentor học tập</h2>
      </section>
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="card p-4">
          <h3 className="mb-4 font-bold text-slate-950">Danh sách mentor</h3>
          <MentorList mentors={mentors} selectedMentorId={selectedMentor?.id} onSelect={handleSelectMentor} />
        </div>
        <ChatBox
          mentor={selectedMentor}
          messages={messages}
          value={message}
          onChange={setMessage}
          onSend={handleSend}
          sending={sending}
          onQuickQuestion={handleQuickQuestion}
        />
      </section>
    </div>
  );
}
