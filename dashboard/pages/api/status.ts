// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectId } from 'mongodb';

import authHandler from '@/middleware/auth';
import { Status } from '@/types/status';
import Access from '@/utils/acess';
import { PERMISSIONS } from '@/utils/permission';

import Process from '../../models/process';

import type { NextApiRequest, NextApiResponse } from 'next';

export default authHandler(async (req: NextApiRequest, res: NextApiResponse<Status>, user) => {
  /* document 
  {
  "_id": "64aab5c67798cd64ad199e1f",
  "pm_id": 0,
  "server": "64aab5c67798cd64ad199e1a",
  "name": "app1",
  "type": "node",
  "stats": {
    "cpu": 0,
    "memory": 45793280,
    "uptime": 316474
  },
  "logs": [],
  "status": "online",
  "restartCount": 0,
  "toggleCount": 0,
  "updatedAt": "2023-07-09T13:27:34.494Z",
  "createdAt": "2023-07-09T13:27:34.494Z",
  "__v": 0
}
  
  */
  const processes = await Process.find(
    {
      ...(req?.body?.process?.length
        ? { _id: { $in: req.body.process?.map((x: string) => new ObjectId(x)) } }
        : {
            _id: { $exists: true },
          }),
      //updatedAt: { $gt: new Date((req.body.timestamp || Date.now()) - 1000 * 60 * 4) },
    },
    {
      _id: 1,
      server: 1,
    }
  );

  const filteredProcesses = processes
    .filter((process) => {
      if (user.acl.owner) return true;
      if (user.acl.admin) return true;
      if (new Access(user.acl.servers).getPerms(process.server.toString(), process._id.toString()).has(PERMISSIONS.MONITORING)) return true;
      return false;
    })
    .map((process) => process._id);

  if (!filteredProcesses.length) return res.status(403).end();

  //TODO: add log permission check

  const pipeline = [
    {
      $match: {
        ...(req?.body?.process?.length
          ? { _id: { $in: filteredProcesses?.map((x: string) => new ObjectId(x)) } }
          : {
              _id: { $exists: true },
            }),
        updatedAt: { $gt: new Date((req.body.timestamp || Date.now()) - 1000 * 60 * 4) },
      },
    },
    {
      $group: {
        _id: null,
        cpu: { $sum: '$stats.cpu' },
        memory: { $sum: '$stats.memory' },
        onlineCount: { $sum: { $cond: [{ $eq: ['$status', 'online'] }, 1, 0] } },
        uptime: { $avg: '$stats.uptime' },
        logs: { $push: '$logs' },
      },
    },
    {
      $project: {
        cpu: 1,
        memory: 1,
        onlineCount: 1,
        uptime: 1,
        logs: {
          $reduce: { input: '$logs', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } },
        },
      },
    },
    {
      $project: {
        _id: 0,
        cpu: 1,
        memory: 1,
        onlineCount: 1,
        uptime: 1,
        logs: {
          $filter: {
            input: '$logs',
            as: 'log',
            cond: { $gt: ['$$log.createdAt', new Date(req.body.timestamp || Date.now())] },
          },
        },
      },
    },
  ];

  const result = await Process.aggregate<Status>(pipeline);

  res.status(200).json(result[0] || {});
});
