import mongoose, { Model } from 'mongoose';

import { MServer } from '@pm2.web/typings';

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

export const serverModel = (mongoose.models.Server as ServerModel & mongoose.Document) || mongoose.model<MServer, ServerModel>('Server', serverSchema);
