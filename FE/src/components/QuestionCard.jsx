import React from 'react';

export default function QuestionCard({ question, selectedAnswer, onSelect }) {
  const isTextQuestion = question.type && question.type !== 'MULTIPLE_CHOICE';

  return (
    <div className="card p-5">
      <h2 className="text-lg font-bold text-slate-950">{question.prompt}</h2>
      {isTextQuestion ? (
        <div className="mt-5">
          <textarea
            className="input min-h-[120px]"
            placeholder="Nhập câu trả lời..."
            value={selectedAnswer || ''}
            onChange={(event) => onSelect(question.id, event.target.value)}
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {(question.choices || []).map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(question.id, option.id)}
              className={`rounded-lg border p-4 text-left text-sm font-semibold transition ${
                selectedAnswer === option.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
