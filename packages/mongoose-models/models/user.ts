import { IUserModel, IUserModelMethods } from "@pm2.web/typings";
import bcrypt from "bcryptjs";
import mongoose, { Model, models } from "mongoose";

type UserModel = Model<IUserModel, object, IUserModelMethods>;

const userSchema = new mongoose.Schema<
  IUserModel,
  UserModel,
  IUserModelMethods
>(
  {
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
  },
  { timestamps: true },
);
// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  if (this.password) this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Check if the provided password matches the user's password

userSchema.methods.checkPassword = async function (password: string) {
  if (!this.password) throw new Error("User has no password set");
  return await bcrypt.compare(password, this.password);
};

const stringifyDate = (date?: Date) =>
  date ? new Date(date).toISOString() : undefined;

// Remove sensitive fields from the user object before sending it to the client
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return {
    ...user,
    updatedAt: stringifyDate(user.updatedAt),
    createdAt: stringifyDate(user.createdAt),
  };
};

export const userModel =
  (models?.User as UserModel) ??
  mongoose.model<IUserModel, UserModel>("User", userSchema);
