import React, { useEffect, useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import RoadmapStage from '../components/RoadmapStage';
import StatCard from '../components/StatCard';
import { getRoadmap, getRoadmapProgress, updateTaskStatus } from '../services/roadmapApi';
import { CheckCircle2, CircleDashed, Clock3 } from 'lucide-react';

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadRoadmap();
  }, []);

  async function loadRoadmap() {
    const nextRoadmap = await getRoadmap('user_001');
    const nextProgress = await getRoadmapProgress(nextRoadmap.id);
    setRoadmap(nextRoadmap);
    setProgress(nextProgress);
  }

  async function handleStatusChange(taskId, status) {
    setUpdatingTaskId(taskId);
    const updated = await updateTaskStatus(roadmap.id, taskId, status);
    const nextProgress = await getRoadmapProgress(updated.id);
    setRoadmap(updated);
    setProgress(nextProgress);
    setToast(status === 'completed' ? 'Đã đánh dấu hoàn thành task.' : 'Đã cập nhật trạng thái task.');
    setUpdatingTaskId('');
  }

  if (!roadmap || !progress) {
    return <div className="card p-8 text-center text-sm font-semibold text-slate-500">Đang tải lộ trình học tập...</div>;
  }

  return (
    <div className="space-y-6">
      {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
      <section className="card p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Lộ trình học tập</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{roadmap.title}</h2>
            <p className="mt-2 text-sm text-slate-500">Timeline học tập từ nền tảng web đến ReactJS, Git và API Integration.</p>
          </div>
          <div className="min-w-full md:min-w-[320px]">
            <ProgressBar value={progress.completionRate} label="Hoàn thành" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Completed" value={progress.completed} icon={CheckCircle2} tone="green" />
        <StatCard title="In Progress" value={progress.inProgress} icon={Clock3} tone="amber" />
        <StatCard title="Not Started" value={progress.notStarted} icon={CircleDashed} tone="slate" />
      </section>

      <section className="space-y-6">
        {roadmap.stages.map((stage, index) => (
          <RoadmapStage
            key={stage.id}
            stage={stage}
            index={index}
            onStatusChange={handleStatusChange}
            updatingTaskId={updatingTaskId}
          />
        ))}
      </section>
    </div>
  );
}

function Toast({ message, onClose }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-mint-100 bg-mint-100 px-4 py-3 text-sm font-semibold text-mint-600">
      {message}
      <button onClick={onClose} className="text-mint-600">Đóng</button>
    </div>
  );
}
