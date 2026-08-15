import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from './auth';
import { AppError } from './error';
import { User } from '../models/User';

export const ADMIN_EMAIL = 'sparshchauhan050@gmail.com';

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Forbidden: Admin access required', 403));
    }

    let userEmail = req.user.email?.toLowerCase().trim();

    // If email wasn't in JWT payload, resolve from database
    if (!userEmail && req.user.id && mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id).select('email role');
      if (user) {
        userEmail = user.email?.toLowerCase().trim();
      }
    }

    if (userEmail === ADMIN_EMAIL.toLowerCase().trim()) {
      return next();
    }

    return next(new AppError('Forbidden: Access restricted to the system administrator only', 403));
  } catch (error) {
    next(error);
  }
};
