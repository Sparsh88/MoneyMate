import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app';
import { connectDB } from '../src/config/db';

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Database connection error in Vercel handler:', err);
    }
  }
  return app(req, res);
}
