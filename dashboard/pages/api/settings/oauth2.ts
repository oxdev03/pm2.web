import { NextApiRequest, NextApiResponse } from 'next';

import authHandler from '@/middleware/auth';
import UserModel from '@/models/user';

export default authHandler(async (req: NextApiRequest, res: NextApiResponse<{ message: string; field?: string }>, user) => {
  if (req.method != 'DELETE') throw new Error('Invalid method');
  if (!user.oauth2?.provider) return res.status(400).json({ message: 'OAuth2 not linked' });

  const currentProvider = user.oauth2?.provider;
  user.oauth2 = undefined;
  await user.save();

  return res.status(200).json({ message: `${currentProvider?.toLocaleUpperCase()} OAuth2 unlinked` });
});
