import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultSummary from '../components/ResultSummary';
import { createLearningProfile } from '../services/learningProfileApi';

const fallbackResult = {
  score: 30,
  matchPercentage: 60,
  recommendedCareer: 'Frontend Developer',
  strongSkills: ['HTML/CSS', 'JavaScript', 'ReactJS'],
  weakSkills: ['Git', 'API Integration', 'Testing'],
  suggestedRoadmap: ['Web Foundation', 'JavaScript Foundation', 'ReactJS Basic'],
};

export default function AssessmentResult() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState('');
  const result = useMemo(() => {
    const stored = sessionStorage.getItem('assessmentResult');
    return stored ? JSON.parse(stored) : fallbackResult;
  }, []);

  async function handleCreateProfile() {
    setCreating(true);
    await createLearningProfile(result);
    setToast('Đã tạo hồ sơ học tập thành công.');
    setCreating(false);
    setTimeout(() => navigate('/profile'), 450);
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="rounded-lg border border-mint-100 bg-mint-100 px-4 py-3 text-sm font-semibold text-mint-600">{toast}</div>
      ) : null}
      <ResultSummary
        result={result}
        creating={creating}
        onCreateProfile={handleCreateProfile}
        onViewRoadmap={() => navigate('/roadmap')}
      />
    </div>
  );
}
