import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  user?: Types.ObjectId; // null or undefined means system-default category
  name: string;
  type: 'income' | 'expense';
  icon: string; // Lucide icon name, e.g., 'Home', 'ShoppingBag'
  color: string; // Tailwind hex color or color class
}

const CategorySchema = new Schema<ICategory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

CategorySchema.index({ user: 1, name: 1 }, { unique: true });

export const Category = model<ICategory>('Category', CategorySchema);
export const getDefaultCategories = () => [
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3B82F6' },
  { name: 'Investments', type: 'income', icon: 'TrendingUp', color: '#8B5CF6' },
  { name: 'Gifts & Others', type: 'income', icon: 'Gift', color: '#EC4899' },
  
  { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#EF4444' },
  { name: 'Rent & Utilities', type: 'expense', icon: 'Home', color: '#F59E0B' },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#6366F1' },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#D946EF' },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#06B6D4' },
  { name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: '#10B981' },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#8B5CF6' },
  { name: 'Travel', type: 'expense', icon: 'Plane', color: '#14B8A6' },
];
