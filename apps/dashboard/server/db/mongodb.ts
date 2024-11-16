import * as mongoose from "mongoose";

import { env } from "@/env.js";

const connectionOptions = {
  bufferCommands: false,
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
const globalWithMongo = global as typeof globalThis & {
  _mongooseConn?: typeof mongoose;
};

async function connectDB() {
  globalWithMongo._mongooseConn ??= await mongoose.connect(env.DB_URI, connectionOptions).then((mongoose) => {
    console.log("[DATABASE] Connected");
    return mongoose;
  });

  return globalWithMongo._mongooseConn;
}

export default connectDB;
