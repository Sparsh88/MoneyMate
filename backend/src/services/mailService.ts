import { sendMail } from '../config/mailer';

export const sendVerificationEmail = async (email: string, name: string, token: string, frontendUrl: string): Promise<void> => {
  const verifyLink = `${frontendUrl}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #10B981; text-align: center;">Welcome to MoneyMate!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for signing up. Please verify your email address to unlock all features of the MoneyMate personal finance platform.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #6B7280;">${verifyLink}</p>
      <p>This verification link will expire in 24 hours.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">MoneyMate Inc. - All rights reserved.</p>
    </div>
  `;
  await sendMail(email, 'Verify Your Email - MoneyMate', html);
};

export const sendPasswordResetEmail = async (email: string, name: string, token: string, frontendUrl: string): Promise<void> => {
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #EF4444; text-align: center;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset the password for your MoneyMate account. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #6B7280;">${resetLink}</p>
      <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
      <p>This reset link will expire in 1 hour.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">MoneyMate Inc. - All rights reserved.</p>
    </div>
  `;
  await sendMail(email, 'Reset Your Password - MoneyMate', html);
};

export const sendBudgetAlertEmail = async (
  email: string,
  name: string,
  categoryName: string,
  limit: number,
  spent: number,
  percentage: number
): Promise<void> => {
  const isOver = percentage >= 100;
  const color = isOver ? '#EF4444' : '#F59E0B';
  const statusText = isOver ? 'Exceeded' : 'Approaching';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: ${color}; text-align: center;">Budget Alert: ${statusText} Limit!</h2>
      <p>Hi ${name},</p>
      <p>This is a notification that you have ${statusText.toLowerCase()} your monthly budget limit for <strong>${categoryName}</strong>.</p>
      <div style="background-color: #F9FAFB; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
        <p style="margin: 5px 0;"><strong>Category:</strong> ${categoryName}</p>
        <p style="margin: 5px 0;"><strong>Monthly Limit:</strong> ₹${limit.toLocaleString('en-IN')}</p>
        <p style="margin: 5px 0;"><strong>Spent So Far:</strong> ₹${spent.toLocaleString('en-IN')}</p>
        <p style="margin: 5px 0;"><strong>Usage:</strong> ${percentage.toFixed(1)}%</p>
      </div>
      <p>Log into your MoneyMate dashboard to adjust your budget or review recent transactions.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">MoneyMate Inc. - All rights reserved.</p>
    </div>
  `;
  await sendMail(email, `Budget Alert: ${categoryName} (${percentage.toFixed(0)}%)`, html);
};

export const sendMonthlySummaryEmail = async (
  email: string,
  name: string,
  monthName: string,
  totalIncome: number,
  totalExpense: number,
  netSavings: number
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #10B981; text-align: center;">Your Monthly Financial Summary - ${monthName}</h2>
      <p>Hi ${name},</p>
      <p>Here is your monthly summary for <strong>${monthName}</strong>. Tracking your spending is the first step to financial freedom!</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
          <th style="text-align: left; padding: 10px;">Metric</th>
          <th style="text-align: right; padding: 10px;">Amount</th>
        </tr>
        <tr style="border-bottom: 1px solid #E5E7EB;">
          <td style="padding: 10px; color: #10B981; font-weight: bold;">Total Income</td>
          <td style="text-align: right; padding: 10px; color: #10B981; font-weight: bold;">+₹${totalIncome.toLocaleString('en-IN')}</td>
        </tr>
        <tr style="border-bottom: 1px solid #E5E7EB;">
          <td style="padding: 10px; color: #EF4444; font-weight: bold;">Total Expense</td>
          <td style="text-align: right; padding: 10px; color: #EF4444; font-weight: bold;">-₹${totalExpense.toLocaleString('en-IN')}</td>
        </tr>
        <tr style="background-color: #EEF2F6;">
          <td style="padding: 10px; font-weight: bold; color: #1E293B;">Net Savings</td>
          <td style="text-align: right; padding: 10px; font-weight: bold; color: #1E293B;">₹${netSavings.toLocaleString('en-IN')}</td>
        </tr>
      </table>
      <p>Keep up the great work! Plan ahead by setting new savings goals for the upcoming month.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9CA3AF; text-align: center;">MoneyMate Inc. - All rights reserved.</p>
    </div>
  `;
  await sendMail(email, `Your Monthly Financial Summary - ${monthName}`, html);
};
