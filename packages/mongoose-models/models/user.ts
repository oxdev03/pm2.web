import bcrypt from "bcrypt";
import mongoose, { Model } from "mongoose";

import { MUser, MUserMethods } from "@pm2.web/typings";

type UserModel = Model<MUser, object, MUserMethods>;

const userSchema = new mongoose.Schema<MUser, UserModel, MUserMethods>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  password: {
    type: String,
    required: true,
  },
  acl: {
    owner: Boolean,
    admin: Boolean,
    servers: [
      {
        server: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Server",
        },
        perms: Number,
        processes: [
          {
            process: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Process",
            },
            perms: Number,
          },
        ],
      },
    ],
  },
  oauth2: {
    provider: {
      type: String,
    },
    providerUserId: {
      type: String,
    },
  },
  updatedAt: Date,
  createdAt: Date,
});
// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  if (this.password) this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Check if the provided password matches the user's password
userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password!);
};

// Remove sensitive fields from the user object before sending it to the client
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return {
    ...user,
    updatedAt: user.updatedAt.toISOString(),
    createdAt: user.createdAt.toISOString(),
  };
};

export const userModel =
  (mongoose.models.User as UserModel & mongoose.Document) ||
  mongoose.model<MUser, UserModel>("User", userSchema);
