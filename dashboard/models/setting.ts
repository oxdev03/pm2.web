import mongoose, { Model } from 'mongoose';

import { ISetting } from '@/types/setting';

type SettingModel = Model<ISetting, {}, {}>;

const settingSchema = new mongoose.Schema({
  polling: {
    backend: {
      type: Number,
      default: 3000,
    },
    frontend: {
      type: Number,
      default: 3000,
    },
  },
  logRotation: Number,
  logRetention: Number,
  excludeDaemon: Boolean,
  registrationCode: String,
  createdAt: Date,
  updatedAt: Date,
});

settingSchema.pre('save', function (next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

export default (mongoose.models.Setting as SettingModel & mongoose.Document) || mongoose.model<ISetting, SettingModel>('Setting', settingSchema);
