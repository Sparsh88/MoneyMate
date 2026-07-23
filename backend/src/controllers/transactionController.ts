import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { AuthRequest } from '../middleware/auth';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { Budget } from '../models/Budget';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { AppError } from '../middleware/error';
import { uploadToCloudinary } from '../config/cloudinary';
import { sendBudgetAlertEmail } from '../services/mailService';
import { generateTransactionsPDF } from '../services/pdfService';
import { DEMO_TRANSACTIONS } from '../utils/demoData';

// Helper to check and alert budget thresholds
const checkBudgetAlerts = async (userId: string, categoryId: string, date: Date) => {
  try {
    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1; // 1-12
    const year = parsedDate.getFullYear();

    // 1. Find category budget for the month/year
    const budget = await Budget.findOne({ user: userId, category: categoryId, month, year });
    if (!budget) return; // No budget set for this category

    const category = await Category.findById(categoryId);
    const user = await User.findById(userId);
    if (!category || !user) return;

    // 2. Calculate current total spending in this category
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseSummary = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          category: category._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spent = expenseSummary[0]?.total || 0;
    const limit = budget.amount;
    const usagePercent = (spent / limit) * 100;

    // Trigger alerts if spent exceeds thresholds
    if (usagePercent >= 100) {
      // Check if we already created a 100% alert for this category/month
      const existingAlert = await Notification.findOne({
        user: userId,
        type: 'budget_alert',
        title: { $regex: new RegExp(`Budget Exceeded: ${category.name}`, 'i') },
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      if (!existingAlert) {
        // Create in-app notification
        await Notification.create({
          user: userId,
          title: `Budget Exceeded: ${category.name}`,
          message: `You have spent $${spent.toFixed(2)} out of your $${limit.toFixed(2)} monthly budget limit for ${category.name}.`,
          type: 'budget_alert',
        });

        // Send email
        await sendBudgetAlertEmail(user.email, user.name, category.name, limit, spent, usagePercent);
      }
    } else if (usagePercent >= 80) {
      // Check if we already created an 80% alert
      const existingAlert = await Notification.findOne({
        user: userId,
        type: 'budget_alert',
        title: { $regex: new RegExp(`Budget Alert: ${category.name}`, 'i') },
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      if (!existingAlert) {
        await Notification.create({
          user: userId,
          title: `Budget Warning: ${category.name} at ${usagePercent.toFixed(0)}%`,
          message: `You have spent $${spent.toFixed(2)} of your $${limit.toFixed(2)} monthly budget limit for ${category.name}.`,
          type: 'budget_alert',
        });

        await sendBudgetAlertEmail(user.email, user.name, category.name, limit, spent, usagePercent);
      }
    }
  } catch (error) {
    console.error('Budget check error:', error);
  }
};

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        transactions: DEMO_TRANSACTIONS,
        pagination: { total: DEMO_TRANSACTIONS.length, page: 1, limit: Number(limit), totalPages: 1 },
      });
    }

    const userId = req.user?.id;

    const query: any = { user: userId };

    if (search) {
      query.description = { $regex: search as string, $options: 'i' };
    }

    if (type === 'income' || type === 'expense') {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const skipNum = (Number(page) - 1) * Number(limit);

    const transactions = await Transaction.find(query)
      .populate('category')
      .sort({ date: -1, createdAt: -1 })
      .skip(skipNum)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { amount, type, category, date, description, receiptUrl, isRecurring, recurringId, notes } = req.body;

    if (!amount || !type || !category || !description) {
      return next(new AppError('Please provide amount, type, category, and description', 400));
    }

    // Check if category is valid
    const cat = await Category.findOne({
      _id: category,
      $or: [{ user: null }, { user: userId }],
    });
    if (!cat) {
      return next(new AppError('Invalid category ID', 400));
    }

    const transaction = await Transaction.create({
      user: userId,
      amount: parseFloat(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      description,
      receiptUrl: receiptUrl || '',
      isRecurring: !!isRecurring,
      recurringId,
      notes: notes || '',
    });

    // Run async budget alerting check
    if (type === 'expense') {
      checkBudgetAlerts(userId!, category, transaction.date);
    }

    res.status(201).json({
      success: true,
      transaction: await transaction.populate('category'),
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body;

    const transaction = await Transaction.findOne({ _id: id, user: userId });
    if (!transaction) {
      return next(new AppError('Transaction not found', 404));
    }

    // Apply changes
    const fields = ['amount', 'type', 'category', 'date', 'description', 'receiptUrl', 'isRecurring', 'recurringId', 'notes'];
    fields.forEach((field) => {
      if (updates[field] !== undefined) {
        (transaction as any)[field] = updates[field];
      }
    });

    await transaction.save();

    // Check budget limit if it is an expense
    if (transaction.type === 'expense') {
      checkBudgetAlerts(userId!, transaction.category.toString(), transaction.date);
    }

    res.status(200).json({
      success: true,
      transaction: await transaction.populate('category'),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await Transaction.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0) {
      return next(new AppError('Transaction not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadReceipt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }

    // Upload buffer to Cloudinary
    const url = await uploadToCloudinary(req.file.buffer, 'receipts');

    res.status(200).json({
      success: true,
      receiptUrl: url,
    });
  } catch (error) {
    next(error);
  }
};

export const exportTransactionsCSV = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const transactions = await Transaction.find({ user: userId })
      .populate('category')
      .sort({ date: -1 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=fintrack-transactions-${Date.now()}.csv`);

    let csvContent = 'Date,Description,Type,Category,Amount,Notes\n';
    transactions.forEach((t) => {
      const dateStr = new Date(t.date).toLocaleDateString();
      const desc = t.description.replace(/"/g, '""');
      const type = t.type;
      const cat = (t.category as any)?.name || 'Uncategorized';
      const amt = t.amount;
      const notes = (t.notes || '').replace(/"/g, '""');
      csvContent += `"${dateStr}","${desc}","${type}","${cat}",${amt},"${notes}"\n`;
    });

    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const exportTransactionsPDF = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const transactions = await Transaction.find({ user: userId })
      .populate('category')
      .sort({ date: -1 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=fintrack-statement-${Date.now()}.pdf`);

    generateTransactionsPDF(res, user.name, transactions);
  } catch (error) {
    next(error);
  }
};

export const importTransactionsCSV = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!req.file) {
      return next(new AppError('Please upload a CSV file', 400));
    }

    const results: any[] = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const inserted: any[] = [];
          
          // Get all available categories (standard and custom) for current user
          const categories = await Category.find({
            $or: [{ user: null }, { user: userId }],
          });

          for (const row of results) {
            const amount = parseFloat(row.Amount || row.amount);
            const type = (row.Type || row.type || 'expense').toLowerCase() === 'income' ? 'income' : 'expense';
            const description = row.Description || row.description || 'CSV Imported Transaction';
            const date = row.Date || row.date ? new Date(row.Date || row.date) : new Date();
            const categoryName = row.Category || row.category || 'Gifts & Others';
            const notes = row.Notes || row.notes || '';

            if (isNaN(amount)) continue; // Skip invalid rows

            // Find matching category (case-insensitive)
            let matchedCat = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
            
            if (!matchedCat) {
              // Create a custom category if not found
              matchedCat = await Category.create({
                user: userId,
                name: categoryName,
                type,
                icon: type === 'income' ? 'Briefcase' : 'ShoppingBag',
                color: type === 'income' ? '#10B981' : '#EF4444',
              });
              // Push to cached categories list so we don't duplicate create
              categories.push(matchedCat);
            }

            const transaction = await Transaction.create({
              user: userId,
              amount,
              type,
              category: matchedCat._id,
              date,
              description,
              notes,
            });

            inserted.push(transaction);

            if (type === 'expense') {
              checkBudgetAlerts(userId!, matchedCat._id.toString(), date);
            }
          }

          res.status(200).json({
            success: true,
            message: `Successfully imported ${inserted.length} transactions.`,
          });
        } catch (err) {
          next(err);
        }
      });
  } catch (error) {
    next(error);
  }
};
