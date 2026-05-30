import prisma from '../prisma/client';

type RecommendationQueryRow = {
  careerId: string;
  careerTitle: string;
  careerDescription: string;
  careerOutlook: string | null;
  skillId: string;
  skillName: string;
  skillDescription: string | null;
  targetLevel: number;
  courseId: string | null;
  courseTitle: string | null;
  courseDescription: string | null;
  courseDifficulty: string | null;
  courseEstimatedHours: number | null;
  courseUrl: string | null;
  projectId: string | null;
  projectTitle: string | null;
  projectDescription: string | null;
  projectDifficulty: string | null;
  projectEstimatedHours: number | null;
  projectInstructions: string | null;
};

export type CareerRecommendationRecord = {
  id: string;
  title: string;
  description: string;
  outlook: string | null;
  careerSkills: {
    level: number;
    skill: {
      id: string;
      name: string;
      description: string | null;
      courses: {
        id: string;
        title: string;
        description: string | null;
        difficulty: string;
        estimatedHours: number | null;
        url: string | null;
      }[];
      sampleProjects: {
        id: string;
        title: string;
        description: string | null;
        difficulty: string;
        estimatedHours: number | null;
        instructions: string | null;
      }[];
    };
  }[];
};

const toLikePattern = (value: string) => `%${value.trim()}%`;

export const findCareersForGoal = async (careerGoal: string) => {
  const pattern = toLikePattern(careerGoal);
  const rows = await prisma.$queryRaw<RecommendationQueryRow[]>`
    SELECT
      c.id AS careerId,
      c.title AS careerTitle,
      c.description AS careerDescription,
      c.outlook AS careerOutlook,
      s.id AS skillId,
      s.name AS skillName,
      s.description AS skillDescription,
      cs.level AS targetLevel,
      co.id AS courseId,
      co.title AS courseTitle,
      co.description AS courseDescription,
      co.difficulty AS courseDifficulty,
      co.estimatedHours AS courseEstimatedHours,
      co.url AS courseUrl,
      sp.id AS projectId,
      sp.title AS projectTitle,
      sp.description AS projectDescription,
      sp.difficulty AS projectDifficulty,
      sp.estimatedHours AS projectEstimatedHours,
      sp.instructions AS projectInstructions
    FROM Career c
    INNER JOIN CareerSkill cs ON cs.careerId = c.id
    INNER JOIN Skill s ON s.id = cs.skillId
    LEFT JOIN CourseSkill cos ON cos.skillId = s.id
    LEFT JOIN Course co ON co.id = cos.courseId
    LEFT JOIN SampleProjectSkill sps ON sps.skillId = s.id
    LEFT JOIN SampleProject sp ON sp.id = sps.sampleProjectId
    WHERE c.title LIKE ${pattern}
      OR c.description LIKE ${pattern}
      OR c.outlook LIKE ${pattern}
    ORDER BY c.title ASC, cs.level ASC, s.name ASC
    LIMIT 100
  `;

  const careers = new Map<string, CareerRecommendationRecord>();

  for (const row of rows) {
    const career =
      careers.get(row.careerId) ??
      {
        id: row.careerId,
        title: row.careerTitle,
        description: row.careerDescription,
        outlook: row.careerOutlook,
        careerSkills: [],
      };

    let careerSkill = career.careerSkills.find((item) => item.skill.id === row.skillId);
    if (!careerSkill) {
      careerSkill = {
        level: row.targetLevel,
        skill: {
          id: row.skillId,
          name: row.skillName,
          description: row.skillDescription,
          courses: [],
          sampleProjects: [],
        },
      };
      career.careerSkills.push(careerSkill);
    }

    if (row.courseId && !careerSkill.skill.courses.some((course) => course.id === row.courseId)) {
      careerSkill.skill.courses.push({
        id: row.courseId,
        title: row.courseTitle ?? '',
        description: row.courseDescription,
        difficulty: row.courseDifficulty ?? 'beginner',
        estimatedHours: row.courseEstimatedHours,
        url: row.courseUrl,
      });
    }

    if (
      row.projectId &&
      !careerSkill.skill.sampleProjects.some((project) => project.id === row.projectId)
    ) {
      careerSkill.skill.sampleProjects.push({
        id: row.projectId,
        title: row.projectTitle ?? '',
        description: row.projectDescription,
        difficulty: row.projectDifficulty ?? 'beginner',
        estimatedHours: row.projectEstimatedHours,
        instructions: row.projectInstructions,
      });
    }

    careers.set(career.id, career);
  }

  return Array.from(careers.values()).slice(0, 5);
};

export const getAssessmentResultForUser = (assessmentResultId: string, userId: string) =>
  prisma.assessmentResult.findFirst({
    where: {
      id: assessmentResultId,
      userId,
    },
    select: {
      id: true,
      percentage: true,
      classification: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      categoryScores: {
        select: {
          score: true,
          maxScore: true,
          skillCategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

export const createRoadmapWithSkills = (params: {
  userId: string;
  careerId: string;
  title: string;
  summary: string;
  skills: {
    skillId: string;
    targetLevel: number;
  }[];
}) =>
  prisma.roadmap.create({
    data: {
      title: params.title,
      summary: params.summary,
      user: {
        connect: {
          id: params.userId,
        },
      },
      career: {
        connect: {
          id: params.careerId,
        },
      },
      roadmapSkills: {
        create: params.skills.map((skill) => ({
          skillId: skill.skillId,
          targetLevel: skill.targetLevel,
          progress: 0,
        })),
      },
    },
    select: {
      id: true,
    },
  });
