import mongoose, { Model } from "mongoose";

import { IProcessModel } from "@pm2.web/typings";

type ProcessModel = Model<IProcessModel>;

const processSchema = new mongoose.Schema(
  {
    pm_id: {
      type: Number,
      required: true,
    },
    server: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "node",
        "python",
        "ruby",
        "php",
        "bash",
        "go",
        "dotnet",
        "shell",
        "java",
        "other",
      ],
    },
    logs: [
      {
        type: {
          type: String,
          required: true,
          enum: ["info", "error", "success"],
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
      enum: [
        "online",
        "stopping",
        "stopped",
        "launching",
        "errored",
        "one-launch-status",
      ],
    },
    restartCount: Number,
    toggleCount: Number,
    deleteCount: Number,
  },
  { timestamps: true },
);

export const processModel =
  (mongoose.models.Process as ProcessModel) ??
  mongoose.model<IProcessModel>("Process", processSchema);
