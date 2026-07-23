import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: 'budget_alert' | 'bill_reminder' | 'goal_achieved' | 'system';
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['budget_alert', 'bill_reminder', 'goal_achieved', 'system'],
      required: true,
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }
);

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
