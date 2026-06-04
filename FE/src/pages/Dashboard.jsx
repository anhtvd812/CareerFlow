import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, CircleDashed, Clock3, Target } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import SkillComparisonChart from '../components/SkillComparisonChart';
import StatCard from '../components/StatCard';
import { weeklyProgress } from '../data/mockData';
import { getLearningProfile } from '../services/learningProfileApi';
import { getRoadmap, getRoadmapProgress } from '../services/roadmapApi';
import { compareSkills } from '../services/skillsApi';
import { getUserAssessmentHistory } from '../services/userApi';
import { statusClasses, statusLabels } from '../utils/status';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const profile = await getLearningProfile('user_001');
      const roadmap = await getRoadmap('user_001');
      const progress = await getRoadmapProgress(roadmap.id);
      const comparison = await compareSkills(profile.skills, profile.user.careerTarget);

      let assessmentHistory = [];
      try {
        const authUser = JSON.parse(localStorage.getItem('authUser') || 'null');
        const userId = authUser?.id || 'user_demo';
        assessmentHistory = await getUserAssessmentHistory(userId);
      } catch (_error) {
        assessmentHistory = [];
      }

      setData({ profile, roadmap, progress, comparison, assessmentHistory });
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingPanel label="Đang tải dashboard tiến độ học tập..." />;
  }

  const recentTasks = data.roadmap.stages.flatMap((stage) => stage.tasks.map((task) => ({ ...task, stage: stage.name }))).slice(0, 6);
  const latestAssessment = data.assessmentHistory?.[0];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Dashboard</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Tiến độ học tập</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Theo dõi task, kỹ năng và mức độ bám sát tiêu chuẩn nghề nghiệp.</p>
        </div>
        <div className="card w-full p-4 md:w-80">
          <ProgressBar value={data.progress.completionRate} label="Hoàn thành lộ trình" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Completed Tasks" value={data.progress.completed} icon={CheckCircle2} tone="green" />
        <StatCard title="In Progress Tasks" value={data.progress.inProgress} icon={Clock3} tone="amber" />
        <StatCard title="Not Started Tasks" value={data.progress.notStarted} icon={CircleDashed} tone="slate" />
        <StatCard title="Skill Match Percentage" value={`${data.comparison.matchPercentage}%`} icon={Target} tone="brand" />
      </section>

      {latestAssessment ? (
        <section className="card p-5">
          <h3 className="text-lg font-bold text-slate-950">Kết quả đánh giá gần nhất</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Bài đánh giá</p>
              <p className="font-semibold text-slate-950">{latestAssessment.assessment?.title || 'Bài đánh giá'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phân loại</p>
              <p className="font-semibold text-slate-950">{latestAssessment.classification?.name || 'Chưa phân loại'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Điểm tổng</p>
              <p className="font-semibold text-slate-950">
                {latestAssessment.scores?.totalScore ?? 0} / {latestAssessment.scores?.maxScore ?? 0}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Tỉ lệ phù hợp: {latestAssessment.scores?.percentage ?? 0}%
          </p>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-950">Biểu đồ tiến độ theo tuần</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="progressColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="completed" name="Hoàn thành" stroke="#2563eb" fill="url(#progressColor)" strokeWidth={3} />
                <Area type="monotone" dataKey="target" name="Mục tiêu" stroke="#22c55e" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-950">So sánh kỹ năng</h3>
          <SkillComparisonChart data={data.comparison.skillsComparison} />
        </div>
      </section>

      <section className="card p-5">
        <h3 className="text-lg font-bold text-slate-950">Task gần đây</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-950">{task.title}</p>
                <p className="text-sm text-slate-500">{task.stage}</p>
              </div>
              <span className={`badge ${statusClasses[task.status]}`}>{statusLabels[task.status]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LoadingPanel({ label }) {
  return <div className="card p-8 text-center text-sm font-semibold text-slate-500">{label}</div>;
}
