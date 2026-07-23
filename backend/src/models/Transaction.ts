import { Schema, model, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  user: Types.ObjectId;
  amount: number;
  type: 'income' | 'expense';
  category: Types.ObjectId;
  date: Date;
  description: string;
  receiptUrl?: string;
  isRecurring: boolean;
  recurringId?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true, trim: true },
    receiptUrl: { type: String, default: '' },
    isRecurring: { type: Boolean, default: false },
    recurringId: { type: Schema.Types.ObjectId, ref: 'RecurringTransaction' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Compound indexes
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, category: 1 });
TransactionSchema.index({ user: 1, type: 1 });

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
