import React from 'react';

export default function StatCard({ title, value, icon: Icon, tone = 'brand', helper }) {
  const toneClasses = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-mint-100 text-mint-600',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          {helper ? <p className="mt-2 text-xs font-medium text-slate-500">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-lg p-3 ${toneClasses[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
