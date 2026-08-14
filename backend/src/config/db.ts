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
    const isProd = process.env.NODE_ENV === 'production';
    const fallbackUris = isProd
      ? [primaryUri].filter(Boolean) as string[]
      : [
          primaryUri,
          'mongodb://127.0.0.1:27017/moneymate',
          'mongodb://localhost:27017/moneymate',
        ].filter(Boolean) as string[];

    // Remove duplicates
    const uniqueUris = Array.from(new Set(fallbackUris));

    if (uniqueUris.length === 0) {
      console.warn('[DB] No MONGODB_URI configured. Running in Fallback Demo Mode.');
      return;
    }

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

    console.error('[DB] WARNING: Could not connect to MongoDB Atlas database.');
    console.error('[DB] Please verify MONGODB_URI in Render environment variables and ensure MongoDB Atlas IP Access List allows 0.0.0.0/0.');
    console.error('[DB] The backend will remain active in Fallback Demo Mode so the service stays alive.');
  })();

  try {
    await cachedPromise;
  } catch (err) {
    cachedPromise = null;
    throw err;
  }
};

