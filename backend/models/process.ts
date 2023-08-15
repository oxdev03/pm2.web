import mongoose, { Model } from 'mongoose';

import { IProcess } from '../types/server.js';

type ProcessModel = Model<IProcess, {}, {}>;

const processSchema = new mongoose.Schema({
  pm_id: {
    type: Number,
    required: true,
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['node', 'python', 'ruby', 'php', 'bash', 'go', 'dotnet', 'shell', 'java', 'other'],
  },
  stats: {
    cpu: Number,
    memory: Number,
    uptime: Number,
  },
  settings: {},
  logs: [
    {
      type: {
        type: String,
        required: true,
        enum: ['info', 'error', 'success'],
      },
      message: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ['online', 'stopping', 'stopped', 'launching', 'errored', 'one-launch-status'],
  },
  restartCount: Number,
  toggleCount: Number,
  deleteCount: Number,
  createdAt: Date,
  updatedAt: Date,
});

processSchema.pre('save', function (next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

export default (mongoose.models.Process as ProcessModel & mongoose.Document) || mongoose.model<IProcess, ProcessModel>('Process', processSchema);
