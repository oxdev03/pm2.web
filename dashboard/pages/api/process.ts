import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';

import authHandler from '@/middleware/auth';
import { Status } from '@/types/status';
import Access from '@/utils/acess';
import { PERMISSIONS } from '@/utils/permission';

import Process from '../../models/process';

export default authHandler(async (req: NextApiRequest, res: NextApiResponse<Status[]>, user) => {
  const result = await Process.aggregate([
    {
      $match: {
        ...(req?.body?.process?.length
          ? { _id: { $in: req.body.process?.map((x: string) => new ObjectId(x)) } }
          : {
              _id: { $exists: true },
            }),
      },
    },
    {
      $project: {
        pm_id: 1,
        server: 1,
        stats: 1,
        status: 1,
        logs: {
          $filter: {
            input: '$logs',
            as: 'log',
            cond: { $gt: ['$$log.createdAt', new Date(req.body.timestamp || Date.now())] },
          },
        },
        updatedAt: 1,
        toggleCount: 1,
        restartCount: 1,
        deleteCount: 1,
      },
    },
  ]);

  for (let i = 0; i < result.length; i++) {
    // check user perms
    if (user.acl.admin || user.acl.owner) continue;

    const userPerms = new Access(user.acl.servers).getPerms(result[i].server.toString(), result[i]._id.toString());

    if (!userPerms.has(PERMISSIONS.MONITORING)) {
      result[i].stats = {
        cpu: 0,
        memory: 0,
        uptime: 0,
      };
    }

    if (!userPerms.has(PERMISSIONS.LOGS)) {
      result[i].logs = [];
    }
  }

  res.status(200).json(result);
});
