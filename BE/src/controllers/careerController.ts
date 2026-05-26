import type { Request, Response } from 'express';

export const listCareers = (_req: Request, res: Response) => {
  res.status(501).json({ message: 'List careers endpoint not implemented yet.' });
};

export const getCareerById = (req: Request, res: Response) => {
  res.status(501).json({ message: `Career ${req.params.careerId} not implemented yet.` });
};
