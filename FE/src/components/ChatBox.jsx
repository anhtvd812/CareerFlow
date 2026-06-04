import React from 'react';
import { Send } from 'lucide-react';

export default function ChatBox({ mentor, messages, value, onChange, onSend, sending, onQuickQuestion }) {
  const quickQuestions = ['Em nên học gì tiếp theo?', 'Kỹ năng nào em còn yếu?', 'Gợi ý project nhỏ cho em'];

  return (
    <div className="card flex min-h-[640px] flex-col overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-950">{mentor?.name || 'Chọn mentor'}</h2>
        <p className="text-sm text-slate-500">{mentor?.role}</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] rounded-lg px-4 py-3 text-sm shadow-sm ${
                message.sender === 'user' ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickQuestions.map((question) => (
            <button key={question} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700" onClick={() => onQuickQuestion(question)}>
              {question}
            </button>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={onSend}>
          <input className="input" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Nhập tin nhắn..." />
          <button className="btn-primary px-3" disabled={sending || !value.trim()} aria-label="Gửi tin nhắn">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
