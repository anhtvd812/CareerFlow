import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import ResultSummary from '../components/ResultSummary';
import { getAssessmentQuestions, submitAssessmentAnswers } from '../services/assessmentApi';
import { createLearningProfile } from '../services/learningProfileApi';

export default function Assessment() {
  const navigate = useNavigate();
  const [assessmentId, setAssessmentId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const isAnswered = (question, value) => {
    if (question.type && question.type !== 'MULTIPLE_CHOICE') {
      return typeof value === 'string' && value.trim().length > 0;
    }
    return Boolean(value);
  };


  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setError('');
        const data = await getAssessmentQuestions();
        setAssessmentId(data.assessmentId);
        setQuestions(data.questions);
      } catch (err) {
        setError(err?.message || 'Không thể tải câu hỏi đánh giá.');
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    const answeredCount = questions.filter((question) => isAnswered(question, answers[question.id])).length;
    return Math.round((answeredCount / questions.length) * 100);
  }, [answers, questions]);

  async function handleSubmit() {
    if (!assessmentId) {
      setError('Không tìm thấy bài đánh giá phù hợp.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await submitAssessmentAnswers({ assessmentId, answers, questions });
      sessionStorage.setItem('assessmentResult', JSON.stringify(response));
      setResult(response);
    } catch (err) {
      setError(err?.message || 'Nộp bài không thành công.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateProfile() {
    setCreating(true);
    await createLearningProfile(result);
    setToast('Đã tạo hồ sơ học tập thành công.');
    setCreating(false);
    setTimeout(() => navigate('/profile'), 450);
  }

  if (loading) {
    return <div className="card p-8 text-center text-sm font-semibold text-slate-500">Đang tải câu hỏi đánh giá...</div>;
  }

  if (error && !result) {
    return <div className="card p-8 text-center text-sm font-semibold text-rose-500">{error}</div>;
  }

  if (result) {
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

  if (!questions.length) {
    return <div className="card p-8 text-center text-sm font-semibold text-slate-500">Chưa có câu hỏi cho bài đánh giá này.</div>;
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const canProceed = isAnswered(currentQuestion, answers[currentQuestion.id]);
  const allAnswered = questions.every((question) => isAnswered(question, answers[question.id]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Đánh giá ban đầu</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">Bài test định hướng năng lực</h2>
        <div className="mt-5 card p-4">
          <ProgressBar value={progress} label={`Câu ${currentIndex + 1}/${questions.length}`} />
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</div>
      ) : null}
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id]}
        onSelect={(questionId, optionId) => setAnswers({ ...answers, [questionId]: optionId })}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button className="btn-secondary" onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))} disabled={currentIndex === 0}>
          Quay lại
        </button>
        {isLast ? (
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting || !allAnswered}>
            {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={() => setCurrentIndex((index) => Math.min(index + 1, questions.length - 1))}
            disabled={!canProceed}
          >
            Tiếp theo
          </button>
        )}
      </div>
    </div>
  );
}
