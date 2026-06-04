import {
  PrismaClient,
  QuestionType,
  TextMatchMode,
  UserSkillSource,
} from '@prisma/client';

const prisma = new PrismaClient();

const upsertCategory = async (name: string, description: string) =>
  prisma.skillCategory.upsert({
    where: { name },
    update: { description },
    create: { name, description },
  });

const upsertClassification = async (name: string, description: string, isDefault = false) =>
  prisma.classification.upsert({
    where: { name },
    update: { description, isDefault },
    create: { name, description, isDefault },
  });

const DEMO_USER_ID = 'user_demo';
const DEMO_ASSESSMENT_ID = 'asmt_core_it';

const main = async () => {
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {
      name: 'Demo User',
      email: 'demo@careerflow.local',
      passwordHash: 'demo_hash',
      role: 'STUDENT',
    },
    create: {
      id: DEMO_USER_ID,
      name: 'Demo User',
      email: 'demo@careerflow.local',
      passwordHash: 'demo_hash',
      role: 'STUDENT',
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: DEMO_USER_ID },
    update: {
      headline: 'IT Student',
      bio: 'Focused on backend engineering and system design.',
      careerGoal: 'Backend Engineer',
    },
    create: {
      userId: DEMO_USER_ID,
      headline: 'IT Student',
      bio: 'Focused on backend engineering and system design.',
      careerGoal: 'Backend Engineer',
      progressPercent: 0,
    },
  });

  const problemSolving = await prisma.skillCategory.upsert({
    where: { name: 'Problem Solving' },
    update: { description: 'Reasoning, algorithms, and analytical thinking.' },
    create: {
      id: 'cat_problem_solving',
      name: 'Problem Solving',
      description: 'Reasoning, algorithms, and analytical thinking.',
    },
  });
  const theory = await prisma.skillCategory.upsert({
    where: { name: 'Theory' },
    update: { description: 'Computer science fundamentals.' },
    create: {
      id: 'cat_theory',
      name: 'Theory',
      description: 'Computer science fundamentals.',
    },
  });
  const practical = await prisma.skillCategory.upsert({
    where: { name: 'Practical' },
    update: { description: 'Hands-on engineering knowledge.' },
    create: {
      id: 'cat_practical',
      name: 'Practical',
      description: 'Hands-on engineering knowledge.',
    },
  });

  const skillNode = await prisma.skill.upsert({
    where: { name: 'Node.js' },
    update: { description: 'Node.js runtime and tooling.' },
    create: { id: 'skill_node', name: 'Node.js', description: 'Node.js runtime and tooling.' },
  });
  const skillSql = await prisma.skill.upsert({
    where: { name: 'SQL' },
    update: { description: 'Relational database fundamentals.' },
    create: { id: 'skill_sql', name: 'SQL', description: 'Relational database fundamentals.' },
  });

  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId: DEMO_USER_ID, skillId: skillNode.id } },
    update: { level: 2, source: UserSkillSource.MANUAL },
    create: { userId: DEMO_USER_ID, skillId: skillNode.id, level: 2, source: UserSkillSource.MANUAL },
  });
  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId: DEMO_USER_ID, skillId: skillSql.id } },
    update: { level: 1, source: UserSkillSource.MANUAL },
    create: { userId: DEMO_USER_ID, skillId: skillSql.id, level: 1, source: UserSkillSource.MANUAL },
  });

  await prisma.userCertification.create({
    data: {
      userId: DEMO_USER_ID,
      name: 'Intro to Backend APIs',
      issuer: 'CareerFlow Academy',
      issuedAt: new Date('2025-11-12T00:00:00.000Z'),
      credentialUrl: 'https://careerflow.local/certificates/backend-apis',
    },
  }).catch(() => undefined);

  const existingAssessment = await prisma.assessment.findUnique({
    where: { id: DEMO_ASSESSMENT_ID },
  });

  if (!existingAssessment) {
    await prisma.assessment.create({
      data: {
        id: DEMO_ASSESSMENT_ID,
        title: 'Core IT Foundations',
        description: 'Baseline assessment covering problem solving, theory, and practical skills.',
        questions: {
          create: [
            {
              id: 'q1',
              prompt: 'Which data structure follows LIFO ordering?',
              type: QuestionType.MULTIPLE_CHOICE,
              weight: 3,
              skillCategoryId: problemSolving.id,
              choices: {
                create: [
                  { id: 'c1', label: 'Queue', value: 'queue', isCorrect: false },
                  { id: 'c2', label: 'Stack', value: 'stack', isCorrect: true, scoreWeight: 1 },
                  { id: 'c3', label: 'Array', value: 'array', isCorrect: false },
                ],
              },
            },
            {
              id: 'q2',
              prompt: 'Big-O of binary search on a sorted array?',
              type: QuestionType.MULTIPLE_CHOICE,
              weight: 2,
              skillCategoryId: theory.id,
              choices: {
                create: [
                  { id: 'c4', label: 'O(n)', value: 'n', isCorrect: false },
                  { id: 'c5', label: 'O(log n)', value: 'log_n', isCorrect: true, scoreWeight: 1 },
                  { id: 'c6', label: 'O(n log n)', value: 'n_log_n', isCorrect: false },
                ],
              },
            },
            {
              id: 'q3',
              prompt: 'Name one tool used to manage dependencies in Node.js.',
              type: QuestionType.TEXT,
              weight: 2,
              skillCategoryId: practical.id,
              textMatchMode: TextMatchMode.KEYWORD,
              minKeywordScore: 1,
              keywords: {
                create: [
                  { id: 'k1', keyword: 'npm', weight: 1 },
                  { id: 'k2', keyword: 'yarn', weight: 1 },
                  { id: 'k3', keyword: 'pnpm', weight: 1 },
                ],
              },
            },
            {
              id: 'q4',
              prompt: 'Explain what REST stands for.',
              type: QuestionType.TEXT,
              weight: 3,
              skillCategoryId: theory.id,
              textMatchMode: TextMatchMode.EXACT,
              textAnswer: 'Representational State Transfer',
            },
          ],
        },
      },
    });
  }

  const strongProblemSolver = await prisma.classification.upsert({
    where: { name: 'Strong Problem Solver' },
    update: { description: 'High analytical scores with solid overall performance.' },
    create: {
      id: 'class_strong_problem_solver',
      name: 'Strong Problem Solver',
      description: 'High analytical scores with solid overall performance.',
    },
  });
  const theoryOriented = await prisma.classification.upsert({
    where: { name: 'Theory-Oriented' },
    update: { description: 'Strong fundamentals but less practical exposure.' },
    create: {
      id: 'class_theory_oriented',
      name: 'Theory-Oriented',
      description: 'Strong fundamentals but less practical exposure.',
    },
  });
  const practicalLearner = await prisma.classification.upsert({
    where: { name: 'Practical Learner' },
    update: { description: 'Comfortable with hands-on tools and workflows.' },
    create: {
      id: 'class_practical_learner',
      name: 'Practical Learner',
      description: 'Comfortable with hands-on tools and workflows.',
    },
  });
  const weakFoundation = await prisma.classification.upsert({
    where: { name: 'Weak Coding Foundation' },
    update: { description: 'Needs to reinforce fundamentals and basic practices.' },
    create: {
      id: 'class_weak_foundation',
      name: 'Weak Coding Foundation',
      description: 'Needs to reinforce fundamentals and basic practices.',
    },
  });
  const balancedProfile = await prisma.classification.upsert({
    where: { name: 'Balanced Profile' },
    update: { description: 'Consistent performance across categories.', isDefault: true },
    create: {
      id: 'class_balanced_profile',
      name: 'Balanced Profile',
      description: 'Consistent performance across categories.',
      isDefault: true,
    },
  });

  const existingRules = await prisma.assessmentClassificationRule.count({
    where: { assessmentId: DEMO_ASSESSMENT_ID },
  });

  if (existingRules === 0) {
    await prisma.assessmentClassificationRule.createMany({
      data: [
        {
          id: 'rule_strong_problem_solver',
          assessmentId: DEMO_ASSESSMENT_ID,
          classificationId: strongProblemSolver.id,
          priority: 1,
          minPercentage: 80,
          minCategoryPercentages: {
            [problemSolving.id]: 0.8,
          },
        },
        {
          id: 'rule_theory_oriented',
          assessmentId: DEMO_ASSESSMENT_ID,
          classificationId: theoryOriented.id,
          priority: 2,
          minCategoryPercentages: {
            [theory.id]: 0.75,
          },
        },
        {
          id: 'rule_practical_learner',
          assessmentId: DEMO_ASSESSMENT_ID,
          classificationId: practicalLearner.id,
          priority: 3,
          minCategoryPercentages: {
            [practical.id]: 0.7,
          },
        },
        {
          id: 'rule_weak_foundation',
          assessmentId: DEMO_ASSESSMENT_ID,
          classificationId: weakFoundation.id,
          priority: 4,
          maxPercentage: 40,
        },
        {
          id: 'rule_balanced_profile',
          assessmentId: DEMO_ASSESSMENT_ID,
          classificationId: balancedProfile.id,
          priority: 5,
        },
      ],
    });
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
