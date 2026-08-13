import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app';
import { connectDB } from '../src/config/db';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in Vercel handler:', err);
  }
  return app(req, res);
}

