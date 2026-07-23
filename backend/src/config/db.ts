import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUris = [
    primaryUri,
    'mongodb://127.0.0.1:27017/moneymate',
    'mongodb://localhost:27017/moneymate',
  ].filter(Boolean) as string[];

  // Remove duplicates
  const uniqueUris = Array.from(new Set(fallbackUris));

  for (const uri of uniqueUris) {
    try {
      const displayUri = uri.includes('@') ? uri.split('@')[1] : uri;
      console.log(`[DB] Attempting MongoDB connection to: ${displayUri}`);
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`[DB] Successfully connected to MongoDB at ${conn.connection.host}`);
      return;
    } catch (error: any) {
      const displayUri = uri.includes('@') ? uri.split('@')[1] : uri;
      console.warn(`[DB] Failed to connect to ${displayUri}: ${error.message}`);
    }
  }

  console.error('[DB] WARNING: Could not connect to any MongoDB instance (Atlas or Local).');
  console.error('[DB] The backend will remain active in Fallback Demo Mode so you can still log in and test the application.');
};
