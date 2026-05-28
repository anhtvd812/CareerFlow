import type { Prisma } from '@prisma/client';
import prisma from '../prisma/client';

const assessmentInclude = {
  questions: {
    include: {
      choices: true,
      keywords: true,
      skillCategory: true,
    },
  },
  classificationRules: {
    include: {
      classification: true,
    },
  },
};

const assessmentPublicSelect = {
  id: true,
  title: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      questions: true,
    },
  },
};

const resultInclude = {
  assessment: true,
  classification: true,
  categoryScores: {
    include: {
      skillCategory: true,
    },
  },
  answers: {
    include: {
      question: true,
      selectedChoice: true,
    },
  },
};

export const getAssessmentForScoring = (assessmentId: string) =>
  prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      isActive: true,
    },
    include: assessmentInclude,
  });

export const listAssessments = () =>
  prisma.assessment.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: assessmentPublicSelect,
  });

export const getAssessmentById = (assessmentId: string) =>
  prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      questions: {
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          prompt: true,
          type: true,
          weight: true,
          skillCategory: {
            select: {
              id: true,
              name: true,
            },
          },
          choices: {
            select: {
              id: true,
              label: true,
              value: true,
            },
          },
        },
      },
    },
  });

export const createAssessmentAttempt = (assessmentId: string, userId: string) =>
  prisma.assessmentAttempt.create({
    data: {
      assessment: {
        connect: {
          id: assessmentId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

export const getAssessmentAttemptById = (attemptId: string) =>
  prisma.assessmentAttempt.findUnique({
    where: {
      id: attemptId,
    },
  });

export const listAssessmentAttemptAnswers = (attemptId: string) =>
  prisma.assessmentAttemptAnswer.findMany({
    where: {
      attemptId,
    },
  });

export const upsertAssessmentAttemptAnswers = async (
  attemptId: string,
  answers: {
    questionId: string;
    selectedChoiceId?: string;
    answerText?: string;
  }[],
) =>
  prisma.$transaction(
    answers.map((answer) =>
      prisma.assessmentAttemptAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId: answer.questionId,
          },
        },
        update: {
          selectedChoiceId: answer.selectedChoiceId,
          answerText: answer.answerText,
        },
        create: {
          attemptId,
          questionId: answer.questionId,
          selectedChoiceId: answer.selectedChoiceId,
          answerText: answer.answerText,
        },
      }),
    ),
  );

export const markAssessmentAttemptSubmitted = (attemptId: string) =>
  prisma.assessmentAttempt.update({
    where: {
      id: attemptId,
    },
    data: {
      status: 'SUBMITTED',
      completedAt: new Date(),
    },
  });

export const createAssessmentResult = (data: Prisma.AssessmentResultCreateInput) =>
  prisma.assessmentResult.create({
    data,
    include: resultInclude,
  });

export const getAssessmentResultById = (resultId: string) =>
  prisma.assessmentResult.findUnique({
    where: {
      id: resultId,
    },
    include: resultInclude,
  });

export const listUserAssessmentResults = (userId: string) =>
  prisma.assessmentResult.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: resultInclude,
  });

export const listClassifications = () =>
  prisma.classification.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      rules: {
        include: {
          assessment: true,
        },
        orderBy: {
          priority: 'asc',
        },
      },
    },
  });
