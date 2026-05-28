import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ResultSummary({ result, onCreateProfile, onViewRoadmap, creating }) {
  const categoryScores = Array.isArray(result?.categoryScores) ? result.categoryScores : [];
  const sortedDesc = [...categoryScores].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  const sortedAsc = [...categoryScores].sort((a, b) => (a.percentage || 0) - (b.percentage || 0));

  const strongSkills = sortedDesc.slice(0, 3).map((item) => item.name);
  const weakSkills = sortedAsc.slice(0, 3).map((item) => item.name);
  const suggestedRoadmap = [];

  if (result?.classification?.description) {
    suggestedRoadmap.push(result.classification.description);
  }
  if (result?.summary) {
    suggestedRoadmap.push(result.summary);
  }

  if (!suggestedRoadmap.length) {
    suggestedRoadmap.push('Ôn lại nền tảng theo điểm yếu.', 'Luyện thêm theo nhóm kỹ năng chính.', 'Làm mini project để củng cố.');
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
            <Sparkles className="h-4 w-4" />
            Kết quả đánh giá
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-950">
            {result?.classification?.name || result?.assessment?.title || 'Kết quả đánh giá'}
          </h2>
          <p className="mt-2 text-slate-500">
            Mức độ phù hợp hiện tại: {result?.scores?.percentage ?? 0}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-5 text-center">
          <p className="text-sm font-semibold text-slate-500">Điểm tổng</p>
          <p className="mt-1 text-4xl font-bold text-brand-700">{result?.scores?.totalScore ?? 0}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryList title="Kỹ năng mạnh" items={strongSkills.length ? strongSkills : ['Chưa có dữ liệu']} tone="green" />
        <SummaryList title="Kỹ năng yếu" items={weakSkills.length ? weakSkills : ['Chưa có dữ liệu']} tone="amber" />
        <SummaryList title="Gợi ý học tiếp" items={suggestedRoadmap} tone="brand" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button className="btn-primary" onClick={onCreateProfile} disabled={creating}>
          {creating ? 'Đang tạo...' : 'Tạo hồ sơ học tập'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button className="btn-secondary" onClick={onViewRoadmap}>
          Xem lộ trình học tập
        </button>
      </div>
    </div>
  );
}

function SummaryList({ title, items, tone }) {
  const toneClass = {
    green: 'bg-mint-100 text-mint-600',
    amber: 'bg-amber-100 text-amber-700',
    brand: 'bg-brand-50 text-brand-700',
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`badge ${toneClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
