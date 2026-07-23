import { Schema, model, Document, Types } from 'mongoose';

export interface IRecurringTransaction extends Document {
  user: Types.ObjectId;
  amount: number;
  type: 'income' | 'expense';
  category: Types.ObjectId;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  nextExecutionDate: Date;
  lastExecutedDate?: Date;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringTransactionSchema = new Schema<IRecurringTransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    nextExecutionDate: { type: Date, required: true },
    lastExecutedDate: { type: Date },
    description: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RecurringTransactionSchema.index({ user: 1, nextExecutionDate: 1, isActive: 1 });

export const RecurringTransaction = model<IRecurringTransaction>('RecurringTransaction', RecurringTransactionSchema);
