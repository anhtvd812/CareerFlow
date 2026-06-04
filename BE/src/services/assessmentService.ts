import type {
  Assessment,
  AssessmentClassificationRule,
  AssessmentQuestion,
  Classification,
  QuestionChoice,
  QuestionKeyword,
} from '@prisma/client';
import { QuestionType, TextMatchMode } from '@prisma/client';
import { ApiError } from '../utils/errors';
import prisma from '../prisma/client';
import {
  createAssessmentResult,
  createAssessmentAttempt,
  getAssessmentById,
  getAssessmentForScoring,
  getAssessmentResultById,
  getAssessmentAttemptById,
  listAssessments,
  listClassifications,
  listAssessmentAttemptAnswers,
  listUserAssessmentResults,
  markAssessmentAttemptSubmitted,
  upsertAssessmentAttemptAnswers,
  findExistingRoadmap,
  createRoadmapWithSkills,
  getRoadmapWithSkills,
} from '../repositories/assessmentRepository';
import type { AttemptAnswerInput, SubmitAnswerInput } from '../validators/assessmentValidators';
import { updateProfileFromAssessment } from './profileService';

type AssessmentForScoring = Assessment & {
  questions: (AssessmentQuestion & {
    choices: QuestionChoice[];
    keywords: QuestionKeyword[];
    skillCategory: { id: string; name: string } | null;
  })[];
  classificationRules: (AssessmentClassificationRule & {
    classification: Classification;
    career: { id: string; title: string } | null;
  })[];
};

type CategoryScore = {
  skillCategoryId: string;
  name: string;
  score: number;
  maxScore: number;
};

type ScoredAnswer = {
  questionId: string;
  selectedChoiceId?: string;
  answerText?: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
};

type ClassificationResult = {
  classification: Classification | undefined;
  careerId: string | null;
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const calculateQuestionScore = (
  question: AssessmentForScoring['questions'][number],
  answer: SubmitAnswerInput,
): ScoredAnswer => {
  if (question.type === QuestionType.MULTIPLE_CHOICE) {
    if (!answer.choiceId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'choiceId is required for multiple choice.', {
        questionId: question.id,
      });
    }

    const choice = question.choices.find((item) => item.id === answer.choiceId);
    if (!choice) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'choiceId does not belong to this question.', {
        questionId: question.id,
      });
    }

    const correctWeights = question.choices
      .filter((item) => item.isCorrect)
      .map((item) => item.scoreWeight);
    const correctWeight = correctWeights.length > 0 ? Math.max(...correctWeights) : 1;
    const maxScore = question.weight * correctWeight;
    const isCorrect = choice.isCorrect;
    const score = isCorrect ? question.weight * choice.scoreWeight : 0;

    return {
      questionId: question.id,
      selectedChoiceId: choice.id,
      isCorrect,
      score,
      maxScore,
    };
  }

  if (!answer.answerText) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'answerText is required for text questions.', {
      questionId: question.id,
    });
  }

  const normalizedAnswer = normalizeText(answer.answerText);
  if (normalizedAnswer.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'answerText cannot be empty.', {
      questionId: question.id,
    });
  }

  let isCorrect = false;
  if (question.textMatchMode === TextMatchMode.EXACT && question.textAnswer) {
    isCorrect = normalizedAnswer === normalizeText(question.textAnswer);
  } else {
    const minScore = question.minKeywordScore ?? 1;
    const keywordScore = question.keywords.reduce((total, keyword) => {
      const keywordValue = normalizeText(keyword.keyword);
      return normalizedAnswer.includes(keywordValue) ? total + keyword.weight : total;
    }, 0);
    isCorrect = keywordScore >= minScore;
  }

  if (!question.textAnswer && question.keywords.length === 0) {
    throw new ApiError(500, 'ASSESSMENT_CONFIGURATION_ERROR', 'Text question has no matching rule.', {
      questionId: question.id,
    });
  }

  return {
    questionId: question.id,
    answerText: answer.answerText,
    isCorrect,
    score: isCorrect ? question.weight : 0,
    maxScore: question.weight,
  };
};

const computeClassification = (
  rules: AssessmentForScoring['classificationRules'],
  percentage: number,
  correctCount: number,
  incorrectCount: number,
  categoryPercentages: Record<string, number>,
): ClassificationResult => {
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  const matchesRule = (rule: AssessmentForScoring['classificationRules'][number]) => {
    if (rule.minPercentage !== null && rule.minPercentage !== undefined && percentage < rule.minPercentage) {
      return false;
    }
    if (rule.maxPercentage !== null && rule.maxPercentage !== undefined && percentage > rule.maxPercentage) {
      return false;
    }
    if (rule.minCorrect !== null && rule.minCorrect !== undefined && correctCount < rule.minCorrect) {
      return false;
    }
    if (rule.maxIncorrect !== null && rule.maxIncorrect !== undefined && incorrectCount > rule.maxIncorrect) {
      return false;
    }

    const minCategories = (rule.minCategoryPercentages ?? {}) as Record<string, number>;
    for (const [categoryId, minValue] of Object.entries(minCategories)) {
      const actual = categoryPercentages[categoryId] ?? 0;
      if (actual < minValue) {
        return false;
      }
    }

    const maxCategories = (rule.maxCategoryPercentages ?? {}) as Record<string, number>;
    for (const [categoryId, maxValue] of Object.entries(maxCategories)) {
      const actual = categoryPercentages[categoryId] ?? 0;
      if (actual > maxValue) {
        return false;
      }
    }

    return true;
  };

  const matchedRule = sortedRules.find(matchesRule);
  if (matchedRule) {
    return {
      classification: matchedRule.classification,
      careerId: matchedRule.career?.id ?? null,
    };
  }

  const defaultRule = rules.find((rule) => rule.classification.isDefault);
  return {
    classification: defaultRule?.classification,
    careerId: defaultRule?.career?.id ?? null,
  };
};

const buildSummary = (classification: Classification | undefined, percentage: number) => {
  const rounded = Number(percentage.toFixed(1));
  if (classification) {
    return `${classification.name} with ${rounded}% overall score.`;
  }
  return `Assessment completed with ${rounded}% overall score.`;
};

const formatResult = (result: Awaited<ReturnType<typeof createAssessmentResult>>) => ({
  id: result.id,
  assessment: {
    id: result.assessment.id,
    title: result.assessment.title,
  },
  userId: result.userId,
  classification: result.classification
    ? {
        id: result.classification.id,
        name: result.classification.name,
        description: result.classification.description,
      }
    : null,
  scores: {
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    percentage: result.percentage,
    correctCount: result.correctCount,
    incorrectCount: result.incorrectCount,
  },
  summary: result.summary,
  categoryScores: result.categoryScores.map((category) => ({
    id: category.skillCategoryId,
    name: category.skillCategory.name,
    score: category.score,
    maxScore: category.maxScore,
    percentage:
      category.maxScore > 0 ? Number(((category.score / category.maxScore) * 100).toFixed(1)) : 0,
  })),
  answers: result.answers.map((answer) => ({
    questionId: answer.questionId,
    prompt: answer.question.prompt,
    type: answer.question.type,
    selectedChoice: answer.selectedChoice
      ? {
          id: answer.selectedChoice.id,
          label: answer.selectedChoice.label,
          value: answer.selectedChoice.value,
        }
      : null,
    answerText: answer.answerText,
    isCorrect: answer.isCorrect,
    score: answer.score,
  })),
  createdAt: result.createdAt,
});

const formatAssessmentSummary = (assessment: {
  id: string;
  title: string;
  description: string | null;
  _count: { questions: number };
}) => ({
  id: assessment.id,
  title: assessment.title,
  description: assessment.description,
  questionCount: assessment._count.questions,
});

const formatAssessmentQuestions = (assessment: NonNullable<Awaited<ReturnType<typeof getAssessmentById>>>) => ({
  id: assessment.id,
  title: assessment.title,
  description: assessment.description,
  questions: assessment.questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    type: question.type,
    weight: question.weight,
    skillCategory: question.skillCategory,
    choices: question.choices,
  })),
});

const formatAttempt = (attempt: {
  id: string;
  assessmentId: string;
  userId: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: attempt.id,
  assessmentId: attempt.assessmentId,
  userId: attempt.userId,
  status: attempt.status,
  startedAt: attempt.startedAt,
  completedAt: attempt.completedAt,
  createdAt: attempt.createdAt,
  updatedAt: attempt.updatedAt,
});

export const submitAssessment = async (params: {
  userId: string;
  assessmentId: string;
  answers: SubmitAnswerInput[];
  attemptId?: string;
}) => {
  const assessment = (await getAssessmentForScoring(params.assessmentId)) as AssessmentForScoring | null;
  if (!assessment) {
    throw new ApiError(404, 'ASSESSMENT_NOT_FOUND', 'Assessment not found.');
  }

  const answerMap = new Map(params.answers.map((answer) => [answer.questionId, answer]));

  for (const answer of params.answers) {
    if (!assessment.questions.some((question) => question.id === answer.questionId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid questionId provided.', {
        questionId: answer.questionId,
      });
    }
  }

  const missingQuestions = assessment.questions.filter((question) => !answerMap.has(question.id));
  if (missingQuestions.length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Missing answers for some questions.', {
      missingQuestionIds: missingQuestions.map((question) => question.id),
    });
  }

  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  const categoryScores = new Map<string, CategoryScore>();
  const scoredAnswers: ScoredAnswer[] = [];

  // Scoring logic: evaluate each answer with question config to keep it modular and reusable.
  for (const question of assessment.questions) {
    const answer = answerMap.get(question.id);
    if (!answer) {
      continue;
    }

    const scored = calculateQuestionScore(question, answer);
    scoredAnswers.push(scored);

    totalScore += scored.score;
    maxScore += scored.maxScore;
    if (scored.isCorrect) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }

    if (question.skillCategory) {
      const current = categoryScores.get(question.skillCategory.id) ?? {
        skillCategoryId: question.skillCategory.id,
        name: question.skillCategory.name,
        score: 0,
        maxScore: 0,
      };

      current.score += scored.score;
      current.maxScore += scored.maxScore;
      categoryScores.set(question.skillCategory.id, current);
    }
  }

  const percentage = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(2)) : 0;

  const categoryPercentages = Array.from(categoryScores.values()).reduce(
    (acc, category) => {
      acc[category.skillCategoryId] = category.maxScore > 0 ? category.score / category.maxScore : 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  const classification = computeClassification(
    assessment.classificationRules,
    percentage,
    correctCount,
    incorrectCount,
    categoryPercentages,
  );

  const summary = buildSummary(classification.classification, percentage);

  const result = await createAssessmentResult({
    user: {
      connect: {
        id: params.userId,
      },
    },
    assessment: {
      connect: {
        id: params.assessmentId,
      },
    },
    attempt: params.attemptId
      ? {
          connect: {
            id: params.attemptId,
          },
        }
      : undefined,
    classification: classification.classification
      ? {
          connect: {
            id: classification.classification.id,
          },
        }
      : undefined,
    career: classification.careerId
      ? {
          connect: {
            id: classification.careerId,
          },
        }
      : undefined,
    totalScore,
    maxScore,
    percentage,
    correctCount,
    incorrectCount,
    summary,
    answers: {
      create: scoredAnswers.map((answer) => ({
        assessmentId: params.assessmentId,
        questionId: answer.questionId,
        userId: params.userId,
        selectedChoiceId: answer.selectedChoiceId,
        answerText: answer.answerText,
        isCorrect: answer.isCorrect,
        score: answer.score,
      })),
    },
    categoryScores: {
      create: Array.from(categoryScores.values()).map((category) => ({
        skillCategoryId: category.skillCategoryId,
        score: category.score,
        maxScore: category.maxScore,
      })),
    },
  });

  await updateProfileFromAssessment({
    userId: params.userId,
    assessmentResultId: result.id,
    percentage: result.percentage,
    completedAt: result.createdAt,
  });

  return formatResult(result);
};

export const listAvailableAssessments = async () => {
  const assessments = await listAssessments();
  return assessments.map((assessment) => formatAssessmentSummary(assessment));
};

export const getAssessmentQuestions = async (assessmentId: string) => {
  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) {
    throw new ApiError(404, 'ASSESSMENT_NOT_FOUND', 'Assessment not found.');
  }

  return formatAssessmentQuestions(assessment);
};

export const createAttempt = async (params: { assessmentId: string; userId: string }) => {
  const assessment = await getAssessmentById(params.assessmentId);
  if (!assessment) {
    throw new ApiError(404, 'ASSESSMENT_NOT_FOUND', 'Assessment not found.');
  }

  const attempt = await createAssessmentAttempt(params.assessmentId, params.userId);
  return {
    attempt: formatAttempt(attempt),
    assessment: {
      id: assessment.id,
      title: assessment.title,
    },
  };
};

export const saveAttemptAnswers = async (params: {
  attemptId: string;
  userId: string;
  answers: AttemptAnswerInput[];
}) => {
  const attempt = await getAssessmentAttemptById(params.attemptId);
  if (!attempt) {
    throw new ApiError(404, 'ATTEMPT_NOT_FOUND', 'Assessment attempt not found.');
  }

  if (attempt.userId !== params.userId) {
    throw new ApiError(403, 'ATTEMPT_FORBIDDEN', 'Not allowed to update this attempt.');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'ATTEMPT_FINALIZED', 'Attempt already submitted.');
  }

  const assessment = await getAssessmentForScoring(attempt.assessmentId);
  if (!assessment) {
    throw new ApiError(404, 'ASSESSMENT_NOT_FOUND', 'Assessment not found.');
  }

  for (const answer of params.answers) {
    if (!assessment.questions.some((question) => question.id === answer.questionId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid questionId provided.', {
        questionId: answer.questionId,
      });
    }
  }

  await upsertAssessmentAttemptAnswers(
    params.attemptId,
    params.answers.map((answer) => ({
      questionId: answer.questionId,
      selectedChoiceId: answer.choiceId,
      answerText: answer.answerText,
    })),
  );

  const savedAttempt = await getAssessmentAttemptById(params.attemptId);
  return {
    attempt: savedAttempt ? formatAttempt(savedAttempt) : formatAttempt(attempt),
    savedCount: params.answers.length,
  };
};

export const submitAttempt = async (params: { attemptId: string; userId: string }) => {
  const attempt = await getAssessmentAttemptById(params.attemptId);
  if (!attempt) {
    throw new ApiError(404, 'ATTEMPT_NOT_FOUND', 'Assessment attempt not found.');
  }

  if (attempt.userId !== params.userId) {
    throw new ApiError(403, 'ATTEMPT_FORBIDDEN', 'Not allowed to submit this attempt.');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'ATTEMPT_FINALIZED', 'Attempt already submitted.');
  }

  const attemptAnswers = await listAssessmentAttemptAnswers(attempt.id);
  const answers: SubmitAnswerInput[] = attemptAnswers.map((answer) => ({
    questionId: answer.questionId,
    choiceId: answer.selectedChoiceId ?? undefined,
    answerText: answer.answerText ?? undefined,
  }));

  const result = await submitAssessment({
    userId: attempt.userId,
    assessmentId: attempt.assessmentId,
    answers,
    attemptId: attempt.id,
  });

  const updatedAttempt = await markAssessmentAttemptSubmitted(attempt.id);

  return {
    attempt: formatAttempt(updatedAttempt),
    result,
  };
};

export const getAssessmentResult = async (resultId: string) => {
  const result = await getAssessmentResultById(resultId);
  if (!result) {
    throw new ApiError(404, 'RESULT_NOT_FOUND', 'Assessment result not found.');
  }

  return formatResult(result);
};

export const listUserAssessmentHistory = async (userId: string) => {
  const results = await listUserAssessmentResults(userId);
  return results.map((result) => formatResult(result));
};

export const listAssessmentClassifications = async () => {
  const classifications = await listClassifications();

  return classifications.map((classification) => ({
    id: classification.id,
    name: classification.name,
    description: classification.description,
    isDefault: classification.isDefault,
    rules: classification.rules.map((rule) => ({
      id: rule.id,
      assessment: {
        id: rule.assessmentId,
        title: rule.assessment.title,
      },
      priority: rule.priority,
      minPercentage: rule.minPercentage,
      maxPercentage: rule.maxPercentage,
      minCorrect: rule.minCorrect,
      maxIncorrect: rule.maxIncorrect,
      minCategoryPercentages: rule.minCategoryPercentages,
      maxCategoryPercentages: rule.maxCategoryPercentages,
    })),
  }));
};

// Profile Initialization: Create learning roadmap after assessment
export const initializeUserProfile = async (params: {
  userId: string;
  assessmentResultId: string;
}) => {
  // Validate userId format
  if (!params.userId || typeof params.userId !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid userId provided.');
  }

  // Fetch assessment result
  const result = await getAssessmentResultById(params.assessmentResultId);
  if (!result) {
    throw new ApiError(404, 'ASSESSMENT_RESULT_NOT_FOUND', 'Assessment result not found.');
  }

  // Verify result belongs to user
  if (result.userId !== params.userId) {
    throw new ApiError(403, 'ASSESSMENT_RESULT_FORBIDDEN', 'Assessment result does not belong to this user.');
  }

  // Check if career is assigned (careerId should be populated from classification rule matching)
  if (!result.careerId) {
    throw new ApiError(400, 'CAREER_NOT_ASSIGNED', 'Assessment result does not have an assigned career.');
  }

  const careerId = result.careerId;

  // Fetch career with its skills
  const career = await prisma.career.findUnique({
    where: {
      id: careerId,
    },
    include: {
      careerSkills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!career) {
    throw new ApiError(404, 'CAREER_NOT_FOUND', `Career with id ${careerId} not found.`);
  }

  // Check for existing roadmap (duplicate prevention)
  const existingRoadmap = await findExistingRoadmap(params.userId, careerId);
  if (existingRoadmap) {
    // Return existing roadmap without throwing error
    return formatRoadmapResponse(existingRoadmap, result);
  }

  // Create roadmap with skills (all in one transaction)
  const roadmap = await createRoadmapWithSkills({
    userId: params.userId,
    careerId: careerId,
    careerTitle: career.title,
    careerDescription: career.description || null,
    careerSkills: career.careerSkills.map((cs) => ({
      skillId: cs.skillId,
      level: cs.level,
    })),
  });

  // Fetch complete roadmap with relations for response
  const roadmapData = await getRoadmapWithSkills(roadmap.id);
  if (!roadmapData) {
    throw new ApiError(500, 'DATABASE_ERROR', 'Failed to fetch created roadmap.');
  }

  return formatRoadmapResponse(roadmapData, result);
};

// Helper: Format roadmap response
const formatRoadmapResponse = (
  roadmap: Awaited<ReturnType<typeof getRoadmapWithSkills>>,
  assessmentResult: Awaited<ReturnType<typeof getAssessmentResultById>>,
) => {
  if (!roadmap || !assessmentResult) {
    throw new ApiError(500, 'DATABASE_ERROR', 'Missing required data for response.');
  }

  return {
    success: true,
    roadmap: {
      id: roadmap.id,
      userId: roadmap.userId,
      careerId: roadmap.careerId,
      title: roadmap.title,
      summary: roadmap.summary,
      createdAt: roadmap.createdAt,
    },
    roadmapSkills: roadmap.roadmapSkills.map((rs) => ({
      id: rs.id,
      skillId: rs.skillId,
      skill: {
        id: rs.skill.id,
        name: rs.skill.name,
        description: rs.skill.description,
      },
      targetLevel: rs.targetLevel,
      progress: rs.progress,
      startedAt: roadmap.createdAt,
    })),
    career: {
      id: roadmap.career.id,
      title: roadmap.career.title,
      description: roadmap.career.description,
      outlook: roadmap.career.outlook,
    },
    assessment: {
      resultId: assessmentResult.id,
      percentage: assessmentResult.percentage,
      summary: assessmentResult.summary,
      categoryScores: assessmentResult.categoryScores.map((cs) => ({
        id: cs.skillCategoryId,
        name: cs.skillCategory.name,
        score: cs.score,
        maxScore: cs.maxScore,
        percentage: cs.maxScore > 0 ? Number(((cs.score / cs.maxScore) * 100).toFixed(1)) : 0,
      })),
      classification: assessmentResult.classification
        ? {
            id: assessmentResult.classification.id,
            name: assessmentResult.classification.name,
            description: assessmentResult.classification.description,
          }
        : null,
    },
    message: 'Profile initialization successful',
  };
};
