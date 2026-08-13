import { Schema, model, Document, Types } from 'mongoose';

export interface ISavingsGoal extends Document {
  user: Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  status: 'active' | 'achieved';
  createdAt: Date;
  updatedAt: Date;
}

const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0.01 },
    currentAmount: { type: Number, required: true, default: 0, min: 0 },
    targetDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'achieved'], default: 'active' },
  },
  { timestamps: true }
);

SavingsGoalSchema.index({ user: 1, targetDate: 1 });
SavingsGoalSchema.index({ user: 1, status: 1, targetDate: 1 });

export const SavingsGoal = model<ISavingsGoal>('SavingsGoal', SavingsGoalSchema);

