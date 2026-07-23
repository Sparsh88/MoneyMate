import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './error';

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new AppError('Forbidden: Admin access required', 403));
  }
};
