import { Prisma } from '@prisma/client';
import {
  createRoadmapWithSkills,
  findCareersForGoal,
  getAssessmentResultForUser,
  type CareerRecommendationRecord,
} from '../repositories/recommendationRepository';
import { ApiError } from '../utils/errors';
import type {
  CurrentLevel,
  RoadmapRecommendationInput,
} from '../validators/recommendationValidators';

type AssessmentProfile = NonNullable<Awaited<ReturnType<typeof getAssessmentResultForUser>>>;

const levelScores: Record<CurrentLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const isPrismaDatabaseError = (error: unknown) =>
  error instanceof Prisma.PrismaClientInitializationError ||
  error instanceof Prisma.PrismaClientKnownRequestError ||
  error instanceof Prisma.PrismaClientRustPanicError ||
  error instanceof Prisma.PrismaClientUnknownRequestError;

const withDatabaseHandling = async <T>(operation: () => Promise<T>) => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (isPrismaDatabaseError(error)) {
      throw new ApiError(503, 'DATABASE_UNAVAILABLE', 'Database is unavailable.');
    }

    throw error;
  }
};

const scoreCareerMatch = (career: CareerRecommendationRecord, careerGoal: string) => {
  const goal = normalizeText(careerGoal);
  const title = normalizeText(career.title);
  const description = normalizeText(career.description);
  const outlook = normalizeText(career.outlook ?? '');

  if (title === goal) {
    return 100;
  }
  if (title.includes(goal) || goal.includes(title)) {
    return 80;
  }
  if (description.includes(goal)) {
    return 40;
  }
  if (outlook.includes(goal)) {
    return 20;
  }

  return 0;
};

const pickCareer = (careers: CareerRecommendationRecord[], careerGoal: string) =>
  [...careers].sort((a, b) => scoreCareerMatch(b, careerGoal) - scoreCareerMatch(a, careerGoal))[0];

const scoreFromPercentage = (percentage: number) => {
  if (percentage >= 80) {
    return 2;
  }
  if (percentage >= 50) {
    return 1;
  }
  return 0;
};

const resolveAssessmentSkillLevel = (
  skillName: string,
  assessmentProfile: AssessmentProfile | undefined,
) => {
  if (!assessmentProfile) {
    return undefined;
  }

  const normalizedSkillName = normalizeText(skillName);
  const matchingCategory = assessmentProfile.categoryScores.find((category) => {
    const categoryName = normalizeText(category.skillCategory.name);
    return normalizedSkillName.includes(categoryName) || categoryName.includes(normalizedSkillName);
  });

  if (matchingCategory) {
    const percentage =
      matchingCategory.maxScore > 0 ? (matchingCategory.score / matchingCategory.maxScore) * 100 : 0;
    return scoreFromPercentage(percentage);
  }

  return scoreFromPercentage(assessmentProfile.percentage);
};

const resolveCurrentLevel = (params: {
  skillName: string;
  targetLevel: number;
  currentSkills: Set<string>;
  currentLevel?: CurrentLevel;
  assessmentProfile?: AssessmentProfile;
}) => {
  const skillName = normalizeText(params.skillName);
  if (params.currentSkills.has(skillName)) {
    return params.targetLevel;
  }

  const levels = [
    params.currentLevel ? levelScores[params.currentLevel] : undefined,
    resolveAssessmentSkillLevel(params.skillName, params.assessmentProfile),
  ].filter((level): level is number => level !== undefined);

  return levels.length > 0 ? Math.max(...levels) : 0;
};

const resolveStageTitle = (targetLevel: number) => {
  if (targetLevel <= 1) {
    return 'Foundation';
  }
  if (targetLevel === 2) {
    return 'Practice';
  }
  return 'Advanced Application';
};

const formatCourse = (
  course: CareerRecommendationRecord['careerSkills'][number]['skill']['courses'][number],
) => ({
  id: course.id,
  title: course.title,
  description: course.description,
  difficulty: course.difficulty,
  estimatedHours: course.estimatedHours,
  url: course.url,
});

const formatProject = (
  project: CareerRecommendationRecord['careerSkills'][number]['skill']['sampleProjects'][number],
) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  difficulty: project.difficulty,
  estimatedHours: project.estimatedHours,
  instructions: project.instructions,
});

const uniqueById = <T extends { id: string }>(items: T[]) =>
  Array.from(new Map(items.map((item) => [item.id, item])).values());

export const recommendRoadmap = async (params: {
  userId: string;
  input: RoadmapRecommendationInput;
}) =>
  withDatabaseHandling(async () => {
    const assessmentProfileResult = params.input.assessmentResultId
      ? await getAssessmentResultForUser(params.input.assessmentResultId, params.userId)
      : undefined;
    const assessmentProfile = assessmentProfileResult ?? undefined;

    if (params.input.assessmentResultId && !assessmentProfile) {
      throw new ApiError(
        404,
        'ASSESSMENT_RESULT_NOT_FOUND',
        'Assessment result not found for this user.',
      );
    }

    const careers = await findCareersForGoal(params.input.careerGoal);
    const career = pickCareer(careers, params.input.careerGoal);

    if (!career || career.careerSkills.length === 0) {
      throw new ApiError(404, 'ROADMAP_NOT_FOUND', 'No suitable roadmap found for this goal.');
    }

    const currentSkills = new Set((params.input.currentSkills ?? []).map(normalizeText));
    const analyzedSkills = career.careerSkills.map((careerSkill) => {
      const currentLevel = resolveCurrentLevel({
        skillName: careerSkill.skill.name,
        targetLevel: careerSkill.level,
        currentSkills,
        currentLevel: params.input.currentLevel,
        assessmentProfile,
      });

      return {
        id: careerSkill.skill.id,
        name: careerSkill.skill.name,
        description: careerSkill.skill.description,
        currentLevel,
        targetLevel: careerSkill.level,
        courses: careerSkill.skill.courses.map((course) => formatCourse(course)),
        projects: careerSkill.skill.sampleProjects.map((project) => formatProject(project)),
      };
    });

    const skillGaps = analyzedSkills
      .filter((skill) => skill.currentLevel < skill.targetLevel)
      .map((skill) => ({
        id: skill.id,
        name: skill.name,
        currentLevel: skill.currentLevel,
        targetLevel: skill.targetLevel,
      }));

    const selectedSkills =
      skillGaps.length > 0
        ? analyzedSkills.filter((skill) => skill.currentLevel < skill.targetLevel)
        : analyzedSkills;

    const hasLearningResources = selectedSkills.some(
      (skill) => skill.courses.length > 0 || skill.projects.length > 0,
    );
    if (!hasLearningResources) {
      throw new ApiError(404, 'ROADMAP_NOT_FOUND', 'No suitable learning resources found.');
    }

    const stageGroups = new Map<number, typeof selectedSkills>();
    for (const skill of selectedSkills) {
      const stageOrder = Math.max(1, Math.min(skill.targetLevel, 3));
      const group = stageGroups.get(stageOrder) ?? [];
      group.push(skill);
      stageGroups.set(stageOrder, group);
    }

    const stages = Array.from(stageGroups.entries())
      .sort(([left], [right]) => left - right)
      .map(([order, skills]) => ({
        order,
        title: resolveStageTitle(order),
        knowledge: skills.map((skill) => ({
          skillId: skill.id,
          skillName: skill.name,
          description: skill.description,
          courses: uniqueById(skill.courses),
        })),
        miniProjects: uniqueById(skills.flatMap((skill) => skill.projects)),
      }));

    const summary = `Personalized roadmap for ${career.title} based on ${skillGaps.length} skill gap${
      skillGaps.length === 1 ? '' : 's'
    }.`;

    const roadmap = await createRoadmapWithSkills({
      userId: params.userId,
      careerId: career.id,
      title: `${career.title} Roadmap`,
      summary,
      skills: selectedSkills.map((skill) => ({
        skillId: skill.id,
        targetLevel: skill.targetLevel,
      })),
    });

    return {
      roadmapId: roadmap.id,
      career: {
        id: career.id,
        title: career.title,
      },
      summary,
      skillGaps,
      stages,
    };
  });
