import React from 'react';
import RoadmapTaskCard from './TaskCard';

export default function RoadmapStage({ stage, index, onStatusChange, updatingTaskId }) {
  return (
    <section className="relative pl-8">
      <div className="absolute left-0 top-2 h-full w-px bg-slate-200" />
      <div className="absolute left-[-10px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
        {index + 1}
      </div>
      <div className="card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Stage {index + 1}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">{stage.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{stage.description}</p>
        </div>
        <div className="space-y-3">
          {stage.tasks.map((task) => (
            <RoadmapTaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              updating={updatingTaskId === task.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
