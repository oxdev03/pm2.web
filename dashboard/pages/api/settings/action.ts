import { NextApiRequest, NextApiResponse } from 'next';

import authHandler from '@/middleware/auth';
import ProcessModel from '@/models/process';
import ServerModel from '@/models/server';

export default authHandler(async (req: NextApiRequest, res: NextApiResponse<{ message: string }>, user) => {
  if (!user?.acl?.admin && !user?.acl?.owner) return res.status(403).json({ message: 'Unauthorized' });
  const {
    action,
  }: {
    action: 'delete' | 'delete_logs';
  } = req.body;
  if (!['delete', 'delete_logs'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

  if (action == 'delete') {
    await ServerModel.deleteMany({});
    await ProcessModel.deleteMany({});
    return res.status(200).json({ message: 'Server / Process deleted successfully' });
  } else if (action == 'delete_logs') {
    await ProcessModel.updateMany({}, { $set: { logs: [] } });
    return res.status(200).json({ message: 'Logs cleared successfully' });
  }
});
