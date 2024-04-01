import mongoose, { Model } from "mongoose";

import { ISettingModel } from "@pm2.web/typings";

type SettingModel = Model<ISettingModel>;

const settingSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true },
);

export const settingModel =
  (mongoose.models.Setting as SettingModel) ??
  mongoose.model<ISettingModel>("Setting", settingSchema);
