import React from 'react';
import { statusClasses, statusLabels } from '../utils/status';

export default function GoalCard({ goal, onUpdate }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-slate-950">{goal.title}</p>
        <span className={`badge mt-2 ${statusClasses[goal.status]}`}>{statusLabels[goal.status]}</span>
      </div>
      <select className="input sm:w-44" value={goal.status} onChange={(event) => onUpdate(goal.id, event.target.value)}>
        <option value="not_started">Chưa làm</option>
        <option value="in_progress">Đang làm</option>
        <option value="completed">Hoàn thành</option>
      </select>
    </div>
  );
}
