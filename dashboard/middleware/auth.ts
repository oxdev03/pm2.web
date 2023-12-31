import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import UserModel from '@/models/user';
import { MUser, MUserMethods } from '@/types/user';

import connectDB from './mongodb';

const authHandler = (handler: (req: NextApiRequest, res: NextApiResponse, user: IUserModel) => any) => async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const token = await getToken({ req });
  if (!token) return res.status(401).end();
  const user = await UserModel.findOne({ _id: new ObjectId(token.sub) });
  if (!user) return res.status(401).end();
  return handler(req, res, user);
};

type IUserModel =
  | Document<unknown, {}, MUser> &
      Omit<
        MUser &
          Required<{
            _id: string;
          }>,
        keyof MUserMethods
      > &
      MUserMethods;

export default authHandler;
