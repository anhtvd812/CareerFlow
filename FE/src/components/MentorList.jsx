import React from 'react';

export default function MentorList({ mentors, selectedMentorId, onSelect }) {
  return (
    <div className="space-y-2">
      {mentors.map((mentor) => (
        <button
          key={mentor.id}
          onClick={() => onSelect(mentor)}
          className={`w-full rounded-lg border p-4 text-left transition ${
            selectedMentorId === mentor.id ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">{mentor.name}</p>
              <p className="mt-1 text-sm text-slate-500">{mentor.role}</p>
            </div>
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${mentor.online ? 'bg-mint-500' : 'bg-slate-300'}`} />
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-500">{mentor.online ? 'Online' : 'Offline'}</p>
        </button>
      ))}
    </div>
  );
}
