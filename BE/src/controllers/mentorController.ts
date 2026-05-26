import type { Request, Response } from 'express';

export const listMentors = (_req: Request, res: Response) => {
  res.status(501).json({ message: 'List mentors endpoint not implemented yet.' });
};

export const getMentorById = (req: Request, res: Response) => {
  res.status(501).json({ message: `Mentor ${req.params.mentorId} not implemented yet.` });
};
