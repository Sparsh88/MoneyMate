import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { SupportTicket } from '../models/SupportTicket';
import { AppError } from '../middleware/error';

export const getPlatformStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all admin stat queries in parallel
    const [totalUsers, totalTransactions, openTickets, volumeSummary, activeUsersThisMonth] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      SupportTicket.countDocuments({ status: 'open' }),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalVolume: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.distinct('user', {
        date: { $gte: startOfMonth },
      }),
    ]);

    const totalVolume = volumeSummary[0]?.totalVolume || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        totalVolume,
        activeUsersThisMonth: activeUsersThisMonth.length,
        openTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skipNum = (Number(page) - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find()
        .select('-passwordHash -refreshToken -verificationToken -resetPasswordToken')
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .lean(),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};


export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'active' && status !== 'banned') {
      return next(new AppError("Status must be 'active' or 'banned'", 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin' && status === 'banned') {
      return next(new AppError('Cannot ban another admin user', 400));
    }

    user.status = status;
    
    // If banned, clear refresh token to force logout
    if (status === 'banned') {
      user.refreshToken = undefined;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'name email avatar')
      .sort({ status: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};


export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return next(new AppError('Subject and message are required', 400));
    }

    const ticket = await SupportTicket.create({
      user: userId,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return next(new AppError('Support ticket not found', 404));
    }

    ticket.status = 'resolved';
    await ticket.save();

    res.status(200).json({
      success: true,
      ticket,
      message: 'Ticket marked as resolved',
    });
  } catch (error) {
    next(error);
  }
};
