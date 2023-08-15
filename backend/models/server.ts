import mongoose, { Model } from 'mongoose';

import { MServer } from '../types/server.js';

type ServerModel = Model<MServer, {}, {}>;

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  stats: {
    cpu: Number,
    memory: Number,
    memoryMax: Number,
    uptime: Number,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

serverSchema.pre('save', function (next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

export default (mongoose.models.Server as ServerModel & mongoose.Document) || mongoose.model<MServer, ServerModel>('Server', serverSchema);
