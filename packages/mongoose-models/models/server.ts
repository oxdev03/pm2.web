import { IServerModel } from "@pm2.web/typings";
import mongoose, { Model, models } from "mongoose";

const serverSchema = new mongoose.Schema<IServerModel>(
  {
    name: {
      type: String,
      required: true,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    heartbeat: Number,
  },
  { timestamps: true },
);

export const serverModel =
  (models?.Server as Model<IServerModel>) ??
  mongoose.model<IServerModel>("Server", serverSchema);
