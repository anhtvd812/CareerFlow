import { DEMO_USER_ID, request } from './apiClient';

export async function getAssessmentQuestions() {
  const list = await request('/assessments');
  const assessment = list?.assessments?.[0];
  if (!assessment) {
    throw new Error('No assessment found.');
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
    userId: DEMO_USER_ID,
    answers: buildAnswersPayload(questions, answers),
  };

  return request('/assessments/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
