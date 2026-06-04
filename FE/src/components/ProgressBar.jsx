import React from 'react';

export default function ProgressBar({ value, label, showValue = true }) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        {label ? <span className="text-sm font-semibold text-slate-700">{label}</span> : <span />}
        {showValue ? <span className="text-sm font-bold text-brand-700">{safeValue}%</span> : null}
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
