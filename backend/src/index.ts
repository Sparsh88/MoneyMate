import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import mongoose from 'mongoose';
import app from './app';
import { connectDB } from './config/db';
import { RecurringTransaction } from './models/RecurringTransaction';
import { Transaction } from './models/Transaction';
import { Notification } from './models/Notification';
import { User } from './models/User';
import { ensureAdminAccount } from './utils/initAdmin';

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Background Worker to process recurring transactions
const processRecurringTransactions = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  console.log('[Worker] Checking for due recurring transactions...');
  try {
    const now = new Date();
    // Find active recurring transactions where nextExecutionDate is past or equal to now
    const dueRecurring = await RecurringTransaction.find({
      isActive: true,
      nextExecutionDate: { $lte: now },
    });

    if (dueRecurring.length === 0) {
      console.log('[Worker] No recurring transactions due.');
      return;
    }

    console.log(`[Worker] Found ${dueRecurring.length} recurring transactions to process.`);

    for (const rt of dueRecurring) {
      // 1. Create a new transaction record
      await Transaction.create({
        user: rt.user,
        amount: rt.amount,
        type: rt.type,
        category: rt.category,
        date: rt.nextExecutionDate, // Use the scheduled execution date
        description: `${rt.description} (Recurring)`,
        isRecurring: true,
        recurringId: rt._id,
      });

      // 2. Fetch user to send in-app notification
      const user = await User.findById(rt.user);
      if (user) {
        await Notification.create({
          user: rt.user,
          title: `Recurring Payment Executed: ${rt.description}`,
          message: `Your scheduled ${rt.type} for "${rt.description}" of $${rt.amount.toFixed(2)} was automatically recorded.`,
          type: 'bill_reminder',
        });
      }

      // 3. Calculate next execution date
      const nextDate = new Date(rt.nextExecutionDate);
      if (rt.frequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (rt.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (rt.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (rt.frequency === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      rt.lastExecutedDate = rt.nextExecutionDate;
      rt.nextExecutionDate = nextDate;

      // Deactivate if past endDate
      if (rt.endDate && nextDate > rt.endDate) {
        rt.isActive = false;
      }

      await rt.save();
    }
    console.log('[Worker] Finished processing due recurring transactions.');
  } catch (error) {
    console.error('[Worker] Error processing recurring transactions:', error);
  }
};

const startServer = async () => {
  try {
    // Start HTTP server on 0.0.0.0 to satisfy Render / cloud port detection immediately
    const server = app.listen(Number(PORT), HOST, () => {
      console.log(`MoneyMate Backend running in ${process.env.NODE_ENV || 'development'} mode on http://${HOST}:${PORT}`);
      console.log(`Health check endpoints: http://${HOST}:${PORT}/health and http://${HOST}:${PORT}/api/health`);
    });

    // Connect to Database asynchronously without blocking server port detection
    connectDB()
      .then(() => {
        console.log('[Startup] MongoDB initialization completed.');
        // Ensure the dedicated admin account exists and is synchronized
        ensureAdminAccount().catch((err) => console.error('[Admin] Error on startup ensureAdminAccount:', err));
        // Run recurring transactions worker on startup
        processRecurringTransactions();
        // Run worker every 12 hours
        setInterval(processRecurringTransactions, 12 * 60 * 60 * 1000);
      })
      .catch((dbError) => {
        console.error('[Startup] MongoDB connection error:', dbError);
      });

    // Process termination handlers
    const shutdown = (signal: string) => {
      console.log(`[Shutdown] Received ${signal}. Closing server gracefully...`);
      server.close(async () => {
        try {
          if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('[Shutdown] MongoDB connection closed.');
          }
        } catch (err) {
          console.error('[Shutdown] Error during MongoDB disconnection:', err);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Server startup failed critically:', error);
    process.exit(1);
  }
};

// Global unhandled error handlers
process.on('unhandledRejection', (reason: any) => {
  console.error('[Process] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('[Process] Uncaught Exception:', error);
});

startServer();
