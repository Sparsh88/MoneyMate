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

    // Run all 3 summary queries in parallel
    const [overallSummary, monthlySummary, recentTransactions] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
            totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        {
          $group: {
            _id: null,
            monthlyIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
            monthlyExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          },
        },
      ]),
      Transaction.find({ user: userId })
        .select('amount type category date description receiptUrl isRecurring notes createdAt')
        .populate('category', 'name icon color type')
        .sort({ date: -1, createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const lifeIncome = overallSummary[0]?.totalIncome || 0;
    const lifeExpense = overallSummary[0]?.totalExpense || 0;
    const balance = lifeIncome - lifeExpense;

    const monthlyIncome = monthlySummary[0]?.monthlyIncome || 0;
    const monthlyExpense = monthlySummary[0]?.monthlyExpense || 0;
    const monthlySavings = monthlyIncome - monthlyExpense;

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
      return res.status(200).json({ success: true, data: [], categorySpending: [] });
    }

    const populated = await Category.populate(categorySummary, { path: '_id', select: 'name color icon type' });
    const formatted = populated.map((item: any) => ({
      name: item._id?.name || 'Uncategorized',
      value: item.total,
      color: item._id?.color || '#10b981',
    }));

    res.status(200).json({ success: true, data: formatted, categorySpending: formatted });
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 6 month date boundary
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
    const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
    const endOfCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Run 6-month aggregation, budgets query, and category spend aggregation in parallel
    const [trendSummary, budgets, currentMonthCategoryExpenses] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
            expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          },
        },
      ]),
      Budget.find({ user: userId, month: currentMonth, year: currentYear })
        .populate('category', 'name icon color')
        .lean(),
      Transaction.aggregate([
        { $match: { user: userId, type: 'expense', date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
    ]);

    // Build trend summary map: key = "YYYY-M"
    const trendMap = new Map<string, { income: number; expense: number }>();
    trendSummary.forEach((t: any) => {
      const key = `${t._id.year}-${t._id.month}`;
      trendMap.set(key, { income: t.income || 0, expense: t.expense || 0 });
    });

    // Format all 6 months in order
    const incomeVsExpense = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const record = trendMap.get(key) || { income: 0, expense: 0 };
      incomeVsExpense.push({
        month: d.toLocaleString('default', { month: 'short' }),
        income: record.income,
        expense: record.expense,
      });
    }

    // Build category expense map for budget comparisons
    const categoryExpenseMap = new Map<string, number>();
    let totalCurrentMonthExpense = 0;
    currentMonthCategoryExpenses.forEach((c: any) => {
      if (c._id) {
        categoryExpenseMap.set(c._id.toString(), c.total);
      }
      totalCurrentMonthExpense += c.total;
    });

    const budgetComparison = budgets.map((b: any) => {
      const catId = b.category?._id ? b.category._id.toString() : b.category ? b.category.toString() : null;
      const actual = catId ? categoryExpenseMap.get(catId) || 0 : totalCurrentMonthExpense;
      const limit = b.amount;
      const percent = limit > 0 ? Math.min(Math.round((actual / limit) * 100), 100) : 0;

      return {
        categoryName: b.category?.name || 'Overall Budget',
        limit,
        actual,
        percent,
      };
    });

    res.status(200).json({ success: true, incomeVsExpense, budgetComparison });
  } catch (error) {
    next(error);
  }
};

export const getCashFlow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.id);
    const now = new Date();
    const days = 30;

    // Single 30-day date boundary
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1), 0, 0, 0, 0);

    // Single aggregation query for all 30 days
    const dailySummary = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
    ]);

    // Build map for instant lookup: "YYYY-M-D"
    const dailyMap = new Map<string, { income: number; expense: number }>();
    dailySummary.forEach((d: any) => {
      const key = `${d._id.year}-${d._id.month}-${d._id.day}`;
      dailyMap.set(key, { income: d.income || 0, expense: d.expense || 0 });
    });

    const cashflow = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const record = dailyMap.get(key) || { income: 0, expense: 0 };
      cashflow.push({
        date: dayStr,
        income: record.income,
        expense: record.expense,
      });
    }

    res.status(200).json({ success: true, data: cashflow, cashFlow: cashflow });
  } catch (error) {
    next(error);
  }
};

