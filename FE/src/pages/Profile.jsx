import React, { useEffect, useState } from 'react';
import { Plus, Save, UserPen } from 'lucide-react';
import CertificateCard from '../components/CertificateCard';
import GoalCard from '../components/GoalCard';
import ProgressBar from '../components/ProgressBar';
import SkillComparisonChart from '../components/SkillComparisonChart';
import { addCertificate, addSkill, getLearningProfile, updateGoal, updateLearningProfile } from '../services/learningProfileApi';
import { compareSkills } from '../services/skillsApi';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [goalText, setGoalText] = useState('');
  const [skillForm, setSkillForm] = useState({ name: '', level: 50 });
  const [certificateName, setCertificateName] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    refreshProfile();
  }, []);

  async function refreshProfile() {
    const nextProfile = await getLearningProfile('user_001');
    const nextComparison = await compareSkills(nextProfile.skills, nextProfile.user.careerTarget);
    setProfile(nextProfile);
    setComparison(nextComparison);
  }

  async function handleTargetSubmit(event) {
    event.preventDefault();
    if (!goalText.trim()) return;
    setSaving(true);
    const updated = await updateLearningProfile(profile.id, { user: { careerTarget: goalText.trim() } });
    const nextComparison = await compareSkills(updated.skills, updated.user.careerTarget);
    setProfile(updated);
    setComparison(nextComparison);
    setGoalText('');
    setToast('Đã cập nhật mục tiêu học tập.');
    setSaving(false);
  }

  async function handleAddSkill(event) {
    event.preventDefault();
    if (!skillForm.name.trim()) return;
    setSaving(true);
    const updated = await addSkill(profile.id, { name: skillForm.name.trim(), level: skillForm.level });
    setProfile(updated);
    setComparison(await compareSkills(updated.skills, updated.user.careerTarget));
    setSkillForm({ name: '', level: 50 });
    setToast('Đã thêm kỹ năng mới.');
    setSaving(false);
  }

  async function handleAddCertificate(event) {
    event.preventDefault();
    if (!certificateName.trim()) return;
    setSaving(true);
    setProfile(await addCertificate(profile.id, { name: certificateName.trim() }));
    setCertificateName('');
    setToast('Đã thêm chứng chỉ mới.');
    setSaving(false);
  }

  async function handleGoalUpdate(goalId, status) {
    const updated = await updateGoal(profile.id, goalId, status);
    setProfile(updated);
    setToast('Đã cập nhật trạng thái mục tiêu.');
  }

  if (!profile || !comparison) {
    return <div className="card p-8 text-center text-sm font-semibold text-slate-500">Đang tải hồ sơ học tập...</div>;
  }

  return (
    <div className="space-y-6">
      {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="card p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Hồ sơ học tập</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{profile.user.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{profile.user.email}</p>
              <p className="mt-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                {profile.user.careerTarget}
              </p>
            </div>
            <button className="btn-secondary">
              <UserPen className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </button>
          </div>
          <div className="mt-6">
            <ProgressBar value={profile.overallProgress} label="Tiến độ tổng thể" />
          </div>
        </div>

        <form className="card p-5" onSubmit={handleTargetSubmit}>
          <h3 className="font-bold text-slate-950">Sửa mục tiêu học tập</h3>
          <input className="input mt-4" value={goalText} onChange={(event) => setGoalText(event.target.value)} placeholder="Ví dụ: Frontend Developer" />
          <button className="btn-primary mt-3 w-full" disabled={saving}>
            <Save className="h-4 w-4" />
            Lưu mục tiêu
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-950">Kỹ năng hiện có</h3>
          <div className="mt-4 space-y-4">
            {profile.skills.map((skill) => (
              <ProgressBar key={skill.name} label={skill.name} value={skill.level} />
            ))}
          </div>
          <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_120px_auto]" onSubmit={handleAddSkill}>
            <input className="input" value={skillForm.name} onChange={(event) => setSkillForm({ ...skillForm, name: event.target.value })} placeholder="Tên kỹ năng" />
            <input className="input" type="number" min="0" max="100" value={skillForm.level} onChange={(event) => setSkillForm({ ...skillForm, level: event.target.value })} />
            <button className="btn-primary" disabled={saving}>
              <Plus className="h-4 w-4" />
              Thêm
            </button>
          </form>
        </div>
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-950">Kỹ năng còn thiếu</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {comparison.missingSkills.map((skill) => (
              <span key={skill.name} className="badge bg-amber-100 text-amber-700">
                {skill.name}: thiếu {skill.gap}%
              </span>
            ))}
          </div>
          <div className="mt-5">
            <SkillComparisonChart data={comparison.skillsComparison} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-950">Chứng chỉ</h3>
          <div className="mt-4 space-y-3">
            {profile.certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
          <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleAddCertificate}>
            <input className="input" value={certificateName} onChange={(event) => setCertificateName(event.target.value)} placeholder="Tên chứng chỉ mới" />
            <button className="btn-primary" disabled={saving}>
              <Plus className="h-4 w-4" />
              Thêm
            </button>
          </form>
        </div>
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-950">Mục tiêu đang thực hiện</h3>
          <div className="mt-4 space-y-3">
            {profile.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={handleGoalUpdate} />
            ))}
          </div>
        </div>
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
