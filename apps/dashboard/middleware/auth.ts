import { Document } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

import { userModel as UserModel } from "@pm2.web/mongoose-models";
import { MUser, MUserMethods } from "@pm2.web/typings";

import connectDB from "./mongodb";

const authHandler =
  (handler: (req: NextApiRequest, res: NextApiResponse, user: IUserModel) => any) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    await connectDB();
    const token = await getToken({ req });
    if (!token) return res.status(401).end();
    const user = await UserModel.findById(token.sub);
    if (!user) return res.status(401).end();
    return handler(req, res, user);
  };

type IUserModel = Document<unknown, {}, MUser> &
  Omit<
    MUser &
      Required<{
        _id: string;
      }>,
    keyof MUserMethods
  > &
  MUserMethods;

export default authHandler;
