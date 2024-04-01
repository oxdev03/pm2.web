import { Document, Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

import { userModel } from "@pm2.web/mongoose-models";
import { IUserModel, IUserModelMethods } from "@pm2.web/typings";

import connectDB from "./mongodb";

const authHandler =
  (handler: (req: NextApiRequest, res: NextApiResponse, user: UserModel) => any) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    await connectDB();
    const token = await getToken({ req });
    if (!token) return res.status(401).end();
    const user = await userModel.findById(token.sub);
    if (!user) return res.status(401).end();
    return handler(req, res, user);
  };

type UserModel = Document<unknown, {}, IUserModel> &
  Omit<
    IUserModel &
      Required<{
        _id: string;
      }>,
    keyof IUserModelMethods
  > &
  IUserModelMethods;

export default authHandler;
