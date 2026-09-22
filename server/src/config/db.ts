import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { config } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_MEMORY_SERVER__: any;
}

let isConnecting = false;
let atlasAttempted = false;
let isAtlasAvailable = false;

export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async (): Promise<void> => {
  if (isConnecting) return;
  if (isDBConnected()) return;

  isConnecting = true;
  try {
    const uri = config.MONGODB_URI;

    // In Vercel serverless environment:
    if (process.env.VERCEL) {
      if (uri && !uri.includes('127.0.0.1')) {
        try {
          const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
          });
          console.log(`🌱 MongoDB Atlas Connected (Vercel Serverless): ${conn.connection.host}`);
          isConnecting = false;
          return;
        } catch (vercelDbErr) {
          console.error('❌ Vercel MongoDB Atlas Connection Failed:', vercelDbErr);
          isConnecting = false;
          return;
        }
      } else {
        console.warn('⚠️ MONGODB_URI is not configured with MongoDB Atlas on Vercel!');
      }
    }

    // 1. First try remote MongoDB Atlas if provided (only attempt once in local dev)
    if (!atlasAttempted && uri && !uri.includes('127.0.0.1')) {
      atlasAttempted = true;
      try {
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log(`🌱 MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
        isAtlasAvailable = true;
        isConnecting = false;
        return;
      } catch {
        console.warn('⚠️ MongoDB Atlas remote cluster unreachable. Switching permanently to local persistent MongoDB engine...');
      }
    }

    const localUri = 'mongodb://127.0.0.1:27018/organiva_db';

    // 2. Try connecting to already-running local MongoDB engine on port 27018
    try {
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
      console.log(`🌱 Connected to running local MongoDB engine: ${conn.connection.host}`);
      isConnecting = false;
      return;
    } catch {
      // Local instance not responding on 27018, launch or restart MongoMemoryServer
    }

    // 3. Start singleton MongoMemoryServer on fixed port 27018 with persistent storage
    if (!global.__MONGO_MEMORY_SERVER__) {
      const dbDir = path.join(process.cwd(), 'data', 'db');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const { MongoMemoryServer } = await import('mongodb-memory-server');
      global.__MONGO_MEMORY_SERVER__ = await MongoMemoryServer.create({
        instance: {
          port: 27018,
          dbName: 'organiva_db',
          dbPath: dbDir,
          storageEngine: 'wiredTiger',
        },
        spawn: {
          timeout: 120000,
        },
      });
      console.log(`✅ Local embedded MongoDB engine started at: ${global.__MONGO_MEMORY_SERVER__.getUri()}`);
    }

    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`🌱 Connected to local MongoDB engine: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on('disconnected', () => {
  if (isConnecting || mongoose.connection.readyState === 2) return;
  console.warn('⚠️ MongoDB disconnected. Scheduling reconnection in 3s...');
  setTimeout(() => {
    connectDB().catch((err) => console.error('Auto-reconnect error:', err));
  }, 3000);
});

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (global.__MONGO_MEMORY_SERVER__) {
      await global.__MONGO_MEMORY_SERVER__.stop();
      global.__MONGO_MEMORY_SERVER__ = null;
    }
  } catch (error) {
    console.error('Error disconnecting DB:', error);
  }
};


