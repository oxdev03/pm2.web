import mongoose from "mongoose";

const MONGODB_URI = process.env.DB_URI;

mongoose.set("strictQuery", false);

if (!MONGODB_URI) {
  throw new Error("Please define the DB_URI environment variable inside .env");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
//@ts-expect-error cache connection
let cached = global.mongoose;

if (!cached) {
  //@ts-expect-error cache connection
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("[DATABASE] Connected");
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
