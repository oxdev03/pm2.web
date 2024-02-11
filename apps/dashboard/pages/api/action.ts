import { ObjectId } from 'mongodb';

import authHandler from '@/middleware/auth';
import Access from '@/utils/acess';
import { IPermissionConstants, PERMISSIONS } from '@/utils/permission';

import type { NextApiRequest, NextApiResponse } from 'next';
import { processModel } from '@pm2.web/mongoose-models';

export default authHandler(async (req: NextApiRequest, res: NextApiResponse, user) => {
  const { id, action } = req.body;
  if (!['restart', 'stop', 'delete'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

  const process = await processModel.findById(id);
  if (!process) return res.status(404).json({ message: 'Process not found' });

  if (!user.acl.owner && !user.acl.admin) {
    if (!new Access(user.acl.servers).getPerms(process.server.toString(), process._id.toString()).has(PERMISSIONS[action.toUpperCase() as keyof IPermissionConstants])) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
  }

  try {
    switch (action) {
      case 'restart':
        await processModel.updateOne({ _id: new ObjectId(id) }, { $inc: { restartCount: 1 } });
        break;
      case 'stop':
        await processModel.updateOne({ _id: new ObjectId(id) }, { $inc: { toggleCount: 1 } });
        break;
      case 'delete':
        await processModel.updateOne({ _id: new ObjectId(id) }, { $inc: { deleteCount: 1 } });
        break;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }

  return res.status(200).json({ message: 'Action performed successfully' });
});
