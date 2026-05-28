const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('authToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Vui lòng đăng nhập để tiếp tục.');
    }
    const message = payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
};

export async function getAssessmentQuestions() {
  const list = await request('/assessments');
  const assessment = list?.assessments?.[0];
  if (!assessment) {
    throw new Error('Không tìm thấy bài đánh giá phù hợp.');
  }

  const detail = await request(`/assessments/${assessment.id}/questions`);
  return {
    assessmentId: assessment.id,
    title: detail.title,
    description: detail.description,
    questions: detail.questions || [],
  };
}

const buildAnswersPayload = (questions, answers) =>
  questions
    .map((question) => {
      const value = answers[question.id];
      if (question.type && question.type !== 'MULTIPLE_CHOICE') {
        return {
          questionId: question.id,
          answerText: typeof value === 'string' ? value.trim() : String(value || '').trim(),
        };
      }
      return {
        questionId: question.id,
        choiceId: value,
      };
    })
    .filter((answer) => answer.answerText || answer.choiceId);

export async function submitAssessmentAnswers({ assessmentId, answers, questions }) {
  const payload = {
    assessmentId,
    answers: buildAnswersPayload(questions, answers),
  };

  return request('/assessments/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
