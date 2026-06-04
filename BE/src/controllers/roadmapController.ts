import type { TaskStatus as PrismaTaskStatus } from '@prisma/client';
import type { Request, Response } from 'express';
import prisma from '../prisma/client';

type Totals = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
};

const normalizeQueryValue = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const emptyTotals = (): Totals => ({
  totalTasks: 0,
  completedTasks: 0,
  inProgressTasks: 0,
  notStartedTasks: 0,
});

const computeRate = (completed: number, total: number) => (total ? Math.round((completed / total) * 100) : 0);

const applyStatusCount = (totals: Totals, status: PrismaTaskStatus, count: number) => {
  totals.totalTasks += count;
  if (status === 'COMPLETED') {
    totals.completedTasks += count;
  } else if (status === 'IN_PROGRESS') {
    totals.inProgressTasks += count;
  } else {
    totals.notStartedTasks += count;
  }
};

export const getRoadmapProgress = async (req: Request, res: Response) => {
  try {
    const userId = normalizeQueryValue(req.query.userId);
    const roadmapId = normalizeQueryValue(req.query.roadmapId);

    if (!userId && !roadmapId) {
      return res.status(400).json({ message: 'userId or roadmapId is required.' });
    }

    const roadmap = roadmapId
      ? await prisma.roadmap.findUnique({ where: { id: roadmapId } })
      : await prisma.roadmap.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

    if (!roadmap || (userId && roadmap.userId !== userId)) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }
    const stages = await prisma.stage.findMany({
      where: { roadmapId: roadmap.id },
      orderBy: { position: 'asc' },
    });

    if (!stages.length) {
      return res.status(404).json({ message: 'Roadmap has no stages.' });
    }

    const targetUserId = userId ?? roadmap.userId;
    const taskCounts = await prisma.userTask.groupBy({
      by: ['stageId', 'status'],
      where: { roadmapId: roadmap.id, userId: targetUserId },
      _count: { _all: true },
    });

    const stageTotals = new Map<string, Totals>();
    stages.forEach((stage) => stageTotals.set(stage.id, emptyTotals()));

    taskCounts.forEach((row) => {
      const totals = stageTotals.get(row.stageId);
      if (!totals) {
        return;
      }
      applyStatusCount(totals, row.status, row._count._all);
    });

    const stageProgress = stages.map((stage) => {
      const totals = stageTotals.get(stage.id) ?? emptyTotals();
      return {
        id: stage.id,
        name: stage.name,
        description: stage.description,
        position: stage.position,
        totalTasks: totals.totalTasks,
        completedTasks: totals.completedTasks,
        inProgressTasks: totals.inProgressTasks,
        notStartedTasks: totals.notStartedTasks,
        completionRate: computeRate(totals.completedTasks, totals.totalTasks),
      };
    });

    const overallTotals = stageProgress.reduce(
      (acc, stage) => {
        acc.totalTasks += stage.totalTasks;
        acc.completedTasks += stage.completedTasks;
        acc.inProgressTasks += stage.inProgressTasks;
        acc.notStartedTasks += stage.notStartedTasks;
        return acc;
      },
      emptyTotals(),
    );

    if (overallTotals.totalTasks === 0) {
      return res.status(404).json({ message: 'Roadmap has no tasks.' });
    }

    return res.status(200).json({
      roadmapId: roadmap.id,
      userId: roadmap.userId,
      completionRate: computeRate(overallTotals.completedTasks, overallTotals.totalTasks),
      totalTasks: overallTotals.totalTasks,
      completedTasks: overallTotals.completedTasks,
      inProgressTasks: overallTotals.inProgressTasks,
      notStartedTasks: overallTotals.notStartedTasks,
      stages: stageProgress,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load roadmap progress.' });
  }
};
