import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { Category } from '../models/Category';

export const getDashboardSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const overallSummary = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
    ]);

    const lifeIncome = overallSummary[0]?.totalIncome || 0;
    const lifeExpense = overallSummary[0]?.totalExpense || 0;
    const balance = lifeIncome - lifeExpense;

    const monthlySummary = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: null,
          monthlyIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          monthlyExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
    ]);

    const monthlyIncome = monthlySummary[0]?.monthlyIncome || 0;
    const monthlyExpense = monthlySummary[0]?.monthlyExpense || 0;
    const monthlySavings = monthlyIncome - monthlyExpense;

    const recentTransactions = await Transaction.find({ user: userId })
      .populate('category')
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      summary: { balance, totalIncome: lifeIncome, totalExpense: lifeExpense, monthlyIncome, monthlyExpense, monthlySavings },
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategorySpending = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const categorySummary = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    if (categorySummary.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const populated = await Category.populate(categorySummary, { path: '_id' });
    const formatted = populated.map((item: any) => ({
      name: item._id?.name || 'Uncategorized',
      value: item.total,
      color: item._id?.color || '#10b981',
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
      });
    }

    const incomeVsExpense = await Promise.all(
      months.map(async (m) => {
        const summary = await Transaction.aggregate([
          { $match: { user: userId, date: { $gte: m.start, $lte: m.end } } },
          {
            $group: {
              _id: null,
              income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
              expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
            },
          },
        ]);
        return {
          month: m.name,
          income: summary[0]?.income || 0,
          expense: summary[0]?.expense || 0,
        };
      })
    );

    // Get real budget comparison
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const budgets = await Budget.find({ user: userId, month: currentMonth, year: currentYear }).populate('category');

    const budgetComparison = await Promise.all(
      budgets.map(async (b: any) => {
        const catId = b.category?._id || b.category;
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

        const spentSummary = await Transaction.aggregate([
          { $match: { user: userId, category: catId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const actual = spentSummary[0]?.total || 0;
        const limit = b.amount;
        const percent = limit > 0 ? Math.min(Math.round((actual / limit) * 100), 100) : 0;

        return {
          categoryName: b.category?.name || 'Category',
          limit,
          actual,
          percent,
        };
      })
    );

    res.status(200).json({ success: true, incomeVsExpense, budgetComparison });
  } catch (error) {
    next(error);
  }
};

export const getCashFlow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const days = 30;
    const cashflow = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const summary = await Transaction.aggregate([
        { $match: { user: userId, date: { $gte: dayStart, $lte: dayEnd } } },
        {
          $group: {
            _id: null,
            income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
            expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          },
        },
      ]);
      cashflow.push({
        date: dayStr,
        income: summary[0]?.income || 0,
        expense: summary[0]?.expense || 0,
      });
    }
    res.status(200).json({ success: true, data: cashflow });
  } catch (error) {
    next(error);
  }
};
