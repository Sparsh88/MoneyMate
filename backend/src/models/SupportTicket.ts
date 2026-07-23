import { Schema, model, Document, Types } from 'mongoose';

export interface ISupportTicket extends Document {
  user: Types.ObjectId;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

SupportTicketSchema.index({ status: 1, createdAt: -1 });

export const SupportTicket = model<ISupportTicket>('SupportTicket', SupportTicketSchema);
