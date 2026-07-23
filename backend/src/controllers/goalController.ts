import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SavingsGoal } from '../models/SavingsGoal';
import { Notification } from '../models/Notification';
import { AppError } from '../middleware/error';

export const getGoals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const goals = await SavingsGoal.find({ user: userId }).sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      goals,
    });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { name, targetAmount, targetDate, currentAmount } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return next(new AppError('Please provide name, target amount, and target date', 400));
    }

    const goal = await SavingsGoal.create({
      user: userId,
      name,
      targetAmount: parseFloat(targetAmount),
      targetDate: new Date(targetDate),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      goal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, targetAmount, targetDate, currentAmount, contribution } = req.body;

    const goal = await SavingsGoal.findOne({ _id: id, user: userId });
    if (!goal) {
      return next(new AppError('Savings goal not found', 404));
    }

    if (name) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = parseFloat(targetAmount);
    if (targetDate) goal.targetDate = new Date(targetDate);
    
    if (currentAmount !== undefined) {
      goal.currentAmount = parseFloat(currentAmount);
    }

    if (contribution !== undefined) {
      const contr = parseFloat(contribution);
      if (isNaN(contr) || contr <= 0) {
        return next(new AppError('Contribution must be a positive number', 400));
      }
      goal.currentAmount += contr;
    }

    if (goal.currentAmount >= goal.targetAmount) {
      const wasActive = goal.status === 'active';
      goal.status = 'achieved';

      if (wasActive) {
        await Notification.create({
          user: userId,
          title: `Goal Achieved: ${goal.name}! 🎉`,
          message: `Congratulations! You have successfully reached your target goal of ₹${goal.targetAmount.toLocaleString('en-IN')} for '${goal.name}'.`,
          type: 'goal_achieved',
        }).catch(() => {});
      }
    } else {
      goal.status = 'active';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      goal,
      message: goal.status === 'achieved' ? `Goal Achieved! Congratulations! 🎉` : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await SavingsGoal.deleteOne({ _id: id, user: userId });

    res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
