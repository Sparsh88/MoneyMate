import { Schema, model, Document, Types } from 'mongoose';

export interface IBudget extends Document {
  user: Types.ObjectId;
  category: Types.ObjectId | null; // null means a global limit for all expenses
  amount: number;
  month: number; // 1-12
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    amount: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

// Ensure only one budget per category per month per user
BudgetSchema.index({ user: 1, month: 1, year: 1, category: 1 }, { unique: true });

export const Budget = model<IBudget>('Budget', BudgetSchema);
