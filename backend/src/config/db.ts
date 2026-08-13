import mongoose from 'mongoose';

// Global cache for serverless and rapid concurrent initial requests
let cachedPromise: Promise<void> | null = null;

const connectionOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  autoIndex: process.env.NODE_ENV !== 'production',
};

export const connectDB = async (): Promise<void> => {
  // Fast-path: already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If a connection is already in progress, reuse the in-flight promise
  if (cachedPromise && mongoose.connection.readyState === 2) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
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
        const conn = await mongoose.connect(uri, connectionOptions);
        console.log(`[DB] Successfully connected to MongoDB at ${conn.connection.host}`);
        return;
      } catch (error: any) {
        const displayUri = uri.includes('@') ? uri.split('@')[1] : uri;
        console.warn(`[DB] Failed to connect to ${displayUri}: ${error.message}`);
      }
    }

    console.error('[DB] WARNING: Could not connect to any MongoDB instance (Atlas or Local).');
    console.error('[DB] The backend will remain active in Fallback Demo Mode so you can still log in and test the application.');
  })();

  try {
    await cachedPromise;
  } catch (err) {
    cachedPromise = null;
    throw err;
  }
};

