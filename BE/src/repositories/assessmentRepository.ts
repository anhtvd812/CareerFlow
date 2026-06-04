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
      career: true,
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

export const getUserById = (userId: string) =>
  prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

// Roadmap operations for profile initialization
export const findExistingRoadmap = (userId: string, careerId: string) =>
  prisma.roadmap.findFirst({
    where: {
      userId,
      careerId,
    },
    include: {
      roadmapSkills: {
        include: {
          skill: true,
        },
      },
      career: {
        include: {
          careerSkills: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

export const createRoadmapWithSkills = async (params: {
  userId: string;
  careerId: string;
  careerTitle: string;
  careerDescription: string | null;
  careerSkills: Array<{ skillId: string; level: number }>;
}) => {
  // Use transaction to ensure all-or-nothing creation
  return prisma.$transaction(async (tx) => {
    // Create Roadmap
    const roadmap = await tx.roadmap.create({
      data: {
        userId: params.userId,
        careerId: params.careerId,
        title: `${params.careerTitle} Roadmap`,
        summary: params.careerDescription,
      },
    });

    // Create RoadmapSkills for all career skills
    if (params.careerSkills.length > 0) {
      await tx.roadmapSkill.createMany({
        data: params.careerSkills.map((careerSkill) => ({
          roadmapId: roadmap.id,
          skillId: careerSkill.skillId,
          targetLevel: careerSkill.level,
          progress: 0,
        })),
      });
    }

    return roadmap;
  });
};

export const getRoadmapWithSkills = (roadmapId: string) =>
  prisma.roadmap.findUnique({
    where: {
      id: roadmapId,
    },
    include: {
      roadmapSkills: {
        include: {
          skill: true,
        },
      },
      career: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
