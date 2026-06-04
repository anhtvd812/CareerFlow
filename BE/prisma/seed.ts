import {
  PrismaClient,
  QuestionType,
  TextMatchMode,
  UserSkillSource,
} from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_USER_ID = 'user_demo';
const DEMO_ASSESSMENT_ID = 'asmt_core_it';

const seedRecommendationResources = async () => {
  const python = await prisma.skill.upsert({
    where: { id: 'skill_python' },
    update: {
      name: 'Python',
      description: 'Python programming fundamentals for data workflows.',
    },
    create: {
      id: 'skill_python',
      name: 'Python',
      description: 'Python programming fundamentals for data workflows.',
    },
  });

  const sql = await prisma.skill.upsert({
    where: { id: 'skill_sql' },
    update: {
      name: 'SQL',
      description: 'Query relational databases and shape analytical datasets.',
    },
    create: {
      id: 'skill_sql',
      name: 'SQL',
      description: 'Query relational databases and shape analytical datasets.',
    },
  });

  const dataAnalysis = await prisma.skill.upsert({
    where: { id: 'skill_data_analysis' },
    update: {
      name: 'Data Analysis',
      description: 'Explore, clean, and summarize datasets for business decisions.',
    },
    create: {
      id: 'skill_data_analysis',
      name: 'Data Analysis',
      description: 'Explore, clean, and summarize datasets for business decisions.',
    },
  });

  const dataScience = await prisma.career.upsert({
    where: { id: 'career_data_science' },
    update: {
      title: 'Data Science',
      description: 'Analyze data, build models, and communicate insights for product and business teams.',
      outlook: 'Growing demand for data professionals who combine statistics, coding, and domain insight.',
    },
    create: {
      id: 'career_data_science',
      title: 'Data Science',
      description: 'Analyze data, build models, and communicate insights for product and business teams.',
      outlook: 'Growing demand for data professionals who combine statistics, coding, and domain insight.',
    },
  });

  const careerSkills = [
    { skillId: python.id, level: 1 },
    { skillId: sql.id, level: 2 },
    { skillId: dataAnalysis.id, level: 2 },
  ];

  for (const careerSkill of careerSkills) {
    await prisma.careerSkill.upsert({
      where: {
        careerId_skillId: {
          careerId: dataScience.id,
          skillId: careerSkill.skillId,
        },
      },
      update: {
        level: careerSkill.level,
      },
      create: {
        careerId: dataScience.id,
        skillId: careerSkill.skillId,
        level: careerSkill.level,
      },
    });
  }

  const courses = [
    {
      id: 'course_python_foundations',
      title: 'Python Foundations for Data',
      description: 'Learn variables, control flow, functions, files, and common data structures.',
      difficulty: 'beginner',
      estimatedHours: 12,
      url: 'https://docs.python.org/3/tutorial/',
      skillIds: [python.id],
    },
    {
      id: 'course_sql_analytics',
      title: 'SQL for Analytics',
      description: 'Practice joins, grouping, filtering, subqueries, and analytical reporting queries.',
      difficulty: 'intermediate',
      estimatedHours: 10,
      url: null,
      skillIds: [sql.id],
    },
    {
      id: 'course_data_analysis_workflow',
      title: 'Data Analysis Workflow',
      description: 'Clean a dataset, calculate metrics, visualize findings, and write a concise report.',
      difficulty: 'intermediate',
      estimatedHours: 14,
      url: null,
      skillIds: [python.id, dataAnalysis.id],
    },
  ];

  for (const course of courses) {
    await prisma.$executeRaw`
      INSERT INTO Course (id, title, description, difficulty, estimatedHours, url, createdAt, updatedAt)
      VALUES (${course.id}, ${course.title}, ${course.description}, ${course.difficulty}, ${course.estimatedHours}, ${course.url}, NOW(3), NOW(3))
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        difficulty = VALUES(difficulty),
        estimatedHours = VALUES(estimatedHours),
        url = VALUES(url),
        updatedAt = NOW(3)
    `;

    for (const skillId of course.skillIds) {
      await prisma.$executeRaw`
        INSERT INTO CourseSkill (id, courseId, skillId)
        VALUES (${`${course.id}_${skillId}`}, ${course.id}, ${skillId})
        ON DUPLICATE KEY UPDATE skillId = VALUES(skillId)
      `;
    }
  }

  const projects = [
    {
      id: 'project_sales_dashboard',
      title: 'Sales KPI Dashboard',
      description: 'Build a small dashboard from CSV sales data with revenue, retention, and cohort metrics.',
      difficulty: 'intermediate',
      estimatedHours: 8,
      instructions: 'Load a CSV file, clean missing values, calculate KPIs, and present charts plus findings.',
      skillIds: [python.id, dataAnalysis.id],
    },
    {
      id: 'project_sql_customer_segments',
      title: 'Customer Segmentation SQL Report',
      description: 'Write SQL queries that segment customers by purchase frequency and total spend.',
      difficulty: 'intermediate',
      estimatedHours: 6,
      instructions: 'Create joins across customers, orders, and order items, then summarize the top segments.',
      skillIds: [sql.id, dataAnalysis.id],
    },
  ];

  for (const project of projects) {
    await prisma.$executeRaw`
      INSERT INTO SampleProject (id, title, description, difficulty, estimatedHours, instructions, createdAt, updatedAt)
      VALUES (${project.id}, ${project.title}, ${project.description}, ${project.difficulty}, ${project.estimatedHours}, ${project.instructions}, NOW(3), NOW(3))
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        difficulty = VALUES(difficulty),
        estimatedHours = VALUES(estimatedHours),
        instructions = VALUES(instructions),
        updatedAt = NOW(3)
    `;

    for (const skillId of project.skillIds) {
      await prisma.$executeRaw`
        INSERT INTO SampleProjectSkill (id, sampleProjectId, skillId)
        VALUES (${`${project.id}_${skillId}`}, ${project.id}, ${skillId})
        ON DUPLICATE KEY UPDATE skillId = VALUES(skillId)
      `;
    }
  }
};

const main = async () => {
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@careerflow.local' },
    update: {
      name: 'Demo User',
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

  await seedRecommendationResources();
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
