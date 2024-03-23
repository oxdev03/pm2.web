import mongoose from "mongoose";
import { processModel, serverModel, settingModel, userModel } from "@pm2.web/mongoose-models";

export function connectTestDB() {
  const opts = {
    bufferCommands: false,
  };
  mongoose.connect(process.env.DB_URI!, opts).then((mongoose) => {
    return mongoose;
  });
}
export async function clearDB() {
  await processModel.deleteMany();
  await serverModel.deleteMany();
  await settingModel.deleteMany();
  await userModel.deleteMany();
  return null;
}

export async function createUser({
  name,
  email,
  password,
  admin = false,
  owner = true,
}: {
  name: string;
  email: string;
  password: string;
  admin: boolean;
  owner: boolean;
}) {
  const user = new userModel({
    name: name,
    email: email,
    password: password,
    acl: {
      owner: owner,
      admin: admin,
      servers: [],
    },
  });
  await user.save();
  return null;
}
