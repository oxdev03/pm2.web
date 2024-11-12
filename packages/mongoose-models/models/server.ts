import { IServerModel } from "@pm2.web/typings";
import mongoose, { Model, models } from "mongoose";

type ServerModel = Model<IServerModel>;

const serverSchema = new mongoose.Schema<IServerModel, ServerModel>(
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
  (models?.Server as ServerModel) ??
  mongoose.model<IServerModel>("Server", serverSchema);
