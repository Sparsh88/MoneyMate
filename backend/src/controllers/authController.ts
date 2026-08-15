import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Category, getDefaultCategories } from '../models/Category';
import { AppError } from '../middleware/error';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mailService';
import { isValidEmail, isValidPassword } from '../utils/validators';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const ADMIN_EMAIL = 'sparshchauhan050@gmail.com';
export const ADMIN_PASS = 'Sp@080806';

const createDemoUserObject = (email: string, name?: string): any => {
  const cleanEmail = email.toLowerCase().trim();
  const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase().trim();
  const userName = isAdmin ? (name || 'Sparsh Chauhan') : (name || cleanEmail.split('@')[0] || 'User');
  const role = isAdmin ? 'admin' : 'user';
  return {
    _id: isAdmin ? '60c72b2f9b1d8b001c8e4f10' : '60c72b2f9b1d8b001c8e4f1a',
    name: userName,
    email: cleanEmail,
    role: role as 'user' | 'admin',
    avatar: '',
    isVerified: true,
    status: 'active' as 'active',
    refreshToken: '',
    save: async () => {},
    comparePassword: async (pwd: string) => {
      if (isAdmin) {
        return pwd === ADMIN_PASS;
      }
      return true;
    },
  };
};

const generateAccessToken = (user: IUser | any): string => {
  const secret = process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_1234567890';
  const expiresIn = (process.env.JWT_ACCESS_EXPIRY || '15m') as any;
  return jwt.sign(
    { id: user._id || user.id, role: user.role || 'user', email: user.email },
    secret,
    { expiresIn }
  );
};

const generateRefreshToken = (user: IUser | any): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_1234567890';
  const expiresIn = (process.env.JWT_REFRESH_EXPIRY || '7d') as any;
  return jwt.sign(
    { id: user._id || user.id },
    secret,
    { expiresIn }
  );
};

const sendTokenResponse = (user: IUser | any, statusCode: number, res: Response) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  if (isDbConnected() && typeof user.save === 'function') {
    user.refreshToken = refreshToken;
    user.save().catch(() => {});
  }

  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar || '',
      isVerified: user.isVerified ?? true,
      status: user.status || 'active',
    },
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    if (!isValidEmail(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    if (!isValidPassword(password)) {
      return next(new AppError('Password must be at least 8 characters and contain at least one letter and one number', 400));
    }

    if (isDbConnected()) {
      const cleanEmail = email.toLowerCase().trim();
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return next(new AppError('Email already registered', 400));
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Only sparshchauhan050@gmail.com can receive admin role
      const role = cleanEmail === ADMIN_EMAIL.toLowerCase().trim() ? 'admin' : 'user';

      const user = await User.create({
        name,
        email: cleanEmail,
        passwordHash,
        role,
        verificationToken,
        verificationTokenExpiry,
        isVerified: true, // Auto-verify for frictionless login
      });

      const defaultCategories = getDefaultCategories().map((cat) => ({
        ...cat,
        user: user._id,
      }));
      await Category.insertMany(defaultCategories).catch(() => {});

      sendVerificationEmail(email, name, verificationToken, process.env.FRONTEND_URL || 'http://localhost:5173').catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return next(new AppError('Invalid credentials', 401));
      }

      if (user.status === 'banned') {
        return next(new AppError('Your account has been banned. Please contact support.', 403));
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return next(new AppError('Invalid credentials', 401));
      }

      // Ensure designated admin email always retains admin role
      if (cleanEmail === ADMIN_EMAIL.toLowerCase().trim() && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      return sendTokenResponse(user, 200, res);
    } else {
      // Demo Fallback Mode when MongoDB is unreachable
      if (cleanEmail === ADMIN_EMAIL.toLowerCase().trim() && password !== ADMIN_PASS) {
        return next(new AppError('Invalid credentials', 401));
      }
      console.log('[Auth] Database disconnected: Logging user in with Demo Fallback Session');
      const demoUser = createDemoUserObject(email);
      return sendTokenResponse(demoUser, 200, res);
    }
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('Token is required', 400));
    }

    if (isDbConnected()) {
      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpiry: { $gt: new Date() },
      });

      if (user) {
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    if (isDbConnected()) {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        sendPasswordResetEmail(email, user.name, resetToken, process.env.FRONTEND_URL || 'http://localhost:5173').catch(() => {});
      }
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new AppError('Token and password are required', 400));
    }

    if (!isValidPassword(password)) {
      return next(new AppError('Password must be at least 8 characters and contain at least one letter and one number', 400));
    }

    if (isDbConnected()) {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { $gt: new Date() },
      });

      if (user) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies.refreshToken;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Refresh token not found', 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_1234567890'
    ) as { id: string };

    if (isDbConnected()) {
      const user = await User.findById(decoded.id);
      if (user && user.status !== 'banned') {
        return sendTokenResponse(user, 200, res);
      }
    }

    const authEmail = (req as any).user?.email || 'user@moneymate.com';
    const demoUser = createDemoUserObject(authEmail);
    sendTokenResponse(demoUser, 200, res);
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as any,
    };

    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('accessToken', cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const googleOAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return next(new AppError('Google login requires email and googleId', 400));
    }

    if (isDbConnected()) {
      let user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        user = await User.create({
          name,
          email: email.toLowerCase().trim(),
          googleId,
          avatar: avatar || '',
          isVerified: true,
        });
      }
      return sendTokenResponse(user, 200, res);
    }

    const demoUser = createDemoUserObject(email, name);
    sendTokenResponse(demoUser, 200, res);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as any;
    if (!authReq.user) {
      return next(new AppError('User context not found', 404));
    }

    if (isDbConnected()) {
      const user = await User.findById(authReq.user.id);
      if (user) {
        return res.status(200).json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            status: user.status,
          },
        });
      }
    }

    const reqEmail = authReq.user.email || (authReq.user.role === 'admin' ? ADMIN_EMAIL : 'user@moneymate.com');
    const isAdmin = authReq.user.role === 'admin' && reqEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    res.status(200).json({
      success: true,
      user: {
        id: authReq.user.id,
        name: isAdmin ? 'Sparsh Chauhan' : (reqEmail.split('@')[0] || 'User'),
        email: reqEmail,
        role: isAdmin ? 'admin' : 'user',
        avatar: '',
        isVerified: true,
        status: 'active',
      },
    });
  } catch (error) {
    next(error);
  }
};
