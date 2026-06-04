import React from 'react';
import { CheckCircle2, Play, RotateCw } from 'lucide-react';
import { statusClasses, statusLabels } from '../utils/status';

export default function TaskCard({ task, onStatusChange, updating }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-slate-950">{task.title}</h4>
            <span className="badge bg-slate-100 text-slate-600">{task.type}</span>
          </div>
          <span className={`badge mt-3 ${statusClasses[task.status]}`}>{statusLabels[task.status]}</span>
        </div>
        <TaskActions task={task} updating={updating} onStatusChange={onStatusChange} />
      </div>
    </div>
  );
}

function TaskActions({ task, updating, onStatusChange }) {
  if (task.status === 'not_started') {
    return (
      <button className="btn-secondary sm:w-auto" onClick={() => onStatusChange(task.id, 'in_progress')} disabled={updating}>
        {updating ? <RotateCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Bắt đầu
      </button>
    );
  }

  if (task.status === 'in_progress') {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <button className="btn-secondary" onClick={() => onStatusChange(task.id, 'in_progress')} disabled={updating}>
          {updating ? <RotateCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Tiếp tục
        </button>
        <button className="btn-primary" onClick={() => onStatusChange(task.id, 'completed')} disabled={updating}>
          {updating ? <RotateCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Đánh dấu hoàn thành
        </button>
      </div>
    );
  }

  return (
    <button className="btn-secondary" onClick={() => onStatusChange(task.id, 'in_progress')} disabled={updating}>
      <RotateCw className="h-4 w-4" />
      Làm lại
    </button>
  );
}
