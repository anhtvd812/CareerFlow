const { PrismaClient, TaskStatus } = require('@prisma/client');

const prisma = new PrismaClient();

const ids = {
  userId: 'user_demo',
  careerId: 'career_frontend_demo',
  roadmapId: 'roadmap_demo',
  stages: {
    web: 'stage_demo_web',
    js: 'stage_demo_js',
    react: 'stage_demo_react',
    git: 'stage_demo_git',
  },
};

const stageSeed = [
  {
    id: ids.stages.web,
    name: 'Web Foundation',
    description: 'Build strong HTML/CSS fundamentals.',
    position: 1,
  },
  {
    id: ids.stages.js,
    name: 'JavaScript Foundation',
    description: 'Master core JavaScript concepts and DOM.',
    position: 2,
  },
  {
    id: ids.stages.react,
    name: 'React Basics',
    description: 'Learn components, props, and state.',
    position: 3,
  },
  {
    id: ids.stages.git,
    name: 'Git & API Integration',
    description: 'Ship projects with Git workflow and APIs.',
    position: 4,
  },
];

const taskSeed = [
  {
    id: 'task_demo_001',
    stageId: ids.stages.web,
    title: 'Learn HTML Structure',
    type: 'lesson',
    status: TaskStatus.COMPLETED,
  },
  {
    id: 'task_demo_002',
    stageId: ids.stages.web,
    title: 'Learn CSS Layout',
    type: 'lesson',
    status: TaskStatus.COMPLETED,
  },
  {
    id: 'task_demo_003',
    stageId: ids.stages.web,
    title: 'Build Personal Portfolio',
    type: 'project',
    status: TaskStatus.IN_PROGRESS,
  },
  {
    id: 'task_demo_004',
    stageId: ids.stages.js,
    title: 'Learn Variables and Functions',
    type: 'lesson',
    status: TaskStatus.COMPLETED,
  },
  {
    id: 'task_demo_005',
    stageId: ids.stages.js,
    title: 'Learn DOM Manipulation',
    type: 'task',
    status: TaskStatus.IN_PROGRESS,
  },
  {
    id: 'task_demo_006',
    stageId: ids.stages.js,
    title: 'Build Todo List App',
    type: 'project',
    status: TaskStatus.NOT_STARTED,
  },
  {
    id: 'task_demo_007',
    stageId: ids.stages.react,
    title: 'Learn Components',
    type: 'lesson',
    status: TaskStatus.NOT_STARTED,
  },
  {
    id: 'task_demo_008',
    stageId: ids.stages.react,
    title: 'Learn Props and State',
    type: 'lesson',
    status: TaskStatus.NOT_STARTED,
  },
  {
    id: 'task_demo_009',
    stageId: ids.stages.react,
    title: 'Build Weather App',
    type: 'project',
    status: TaskStatus.NOT_STARTED,
  },
  {
    id: 'task_demo_010',
    stageId: ids.stages.git,
    title: 'Learn Git Workflow',
    type: 'lesson',
    status: TaskStatus.NOT_STARTED,
  },
  {
    id: 'task_demo_011',
    stageId: ids.stages.git,
    title: 'Learn Fetch API',
    type: 'lesson',
    status: TaskStatus.NOT_STARTED,
  },
  {
    id: 'task_demo_012',
    stageId: ids.stages.git,
    title: 'Build Movie Search App',
    type: 'project',
    status: TaskStatus.NOT_STARTED,
  },
];

async function main() {
  await prisma.user.upsert({
    where: { id: ids.userId },
    update: {
      email: 'demo@careerflow.local',
      name: 'Demo User',
    },
    create: {
      id: ids.userId,
      email: 'demo@careerflow.local',
      passwordHash: 'seeded_hash',
      name: 'Demo User',
    },
  });

  await prisma.career.upsert({
    where: { id: ids.careerId },
    update: {
      title: 'Frontend Developer',
      description: 'Frontend career track',
    },
    create: {
      id: ids.careerId,
      title: 'Frontend Developer',
      description: 'Frontend career track',
      outlook: 'positive',
    },
  });

  await prisma.roadmap.upsert({
    where: { id: ids.roadmapId },
    update: {
      title: 'Frontend Developer Learning Path',
      summary: 'Seeded roadmap for demo',
      userId: ids.userId,
      careerId: ids.careerId,
    },
    create: {
      id: ids.roadmapId,
      title: 'Frontend Developer Learning Path',
      summary: 'Seeded roadmap for demo',
      userId: ids.userId,
      careerId: ids.careerId,
    },
  });

  for (const stage of stageSeed) {
    await prisma.stage.upsert({
      where: { id: stage.id },
      update: {
        name: stage.name,
        description: stage.description,
        position: stage.position,
        roadmapId: ids.roadmapId,
      },
      create: {
        id: stage.id,
        name: stage.name,
        description: stage.description,
        position: stage.position,
        roadmapId: ids.roadmapId,
      },
    });
  }

  for (const task of taskSeed) {
    await prisma.userTask.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        type: task.type,
        status: task.status,
        stageId: task.stageId,
        roadmapId: ids.roadmapId,
        userId: ids.userId,
      },
      create: {
        id: task.id,
        title: task.title,
        type: task.type,
        status: task.status,
        stageId: task.stageId,
        roadmapId: ids.roadmapId,
        userId: ids.userId,
      },
    });
  }
}

main()
  .then(() => {
    console.log('Seed completed.');
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
