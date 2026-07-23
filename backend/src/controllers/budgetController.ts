import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Budget } from '../models/Budget';
import { Category } from '../models/Category';
import { AppError } from '../middleware/error';

export const getBudgets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { month, year } = req.query;

    const query: any = { user: userId };
    
    if (month) query.month = parseInt(month as string);
    if (year) query.year = parseInt(year as string);

    const currentDate = new Date();
    if (!query.month) query.month = currentDate.getMonth() + 1;
    if (!query.year) query.year = currentDate.getFullYear();

    const budgets = await Budget.find(query).populate('category');

    res.status(200).json({
      success: true,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateBudget = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { category, amount, month, year } = req.body;

    if (amount === undefined || !month || !year) {
      return next(new AppError('Please provide amount, month, and year', 400));
    }

    const budgetAmount = parseFloat(amount);
    if (isNaN(budgetAmount) || budgetAmount < 0) {
      return next(new AppError('Amount must be a positive number', 400));
    }

    const budgetMonth = parseInt(month);
    const budgetYear = parseInt(year);

    if (budgetMonth < 1 || budgetMonth > 12) {
      return next(new AppError('Month must be between 1 and 12', 400));
    }

    let categoryId = null;
    if (category) {
      const cat = await Category.findOne({
        _id: category,
        $or: [{ user: null }, { user: userId }],
      });
      if (cat) {
        categoryId = cat._id;
      }
    }

    const budget = await Budget.findOneAndUpdate(
      { user: userId, category: categoryId, month: budgetMonth, year: budgetYear },
      { amount: budgetAmount },
      { new: true, upsert: true, runValidators: true }
    ).populate('category');

    res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await Budget.deleteOne({ _id: id, user: userId });

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
