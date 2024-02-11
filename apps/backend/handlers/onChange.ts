import mongoose from 'mongoose';
import pm2 from 'pm2';

// mongoose changestream
import { processModel } from '@pm2.web/mongoose-models';
import processInfo from '../utils/processInfo.js';

export default async (serverId: string) => {
  console.log(`[STREAM] Listening for changes on server ${serverId}`);
  const filter = [
    {
      $match: {
        $and: [
          { operationType: { $in: ['update'] } },
          {
            $or: [
              { 'updateDescription.updatedFields.restartCount': { $exists: true } },
              { 'updateDescription.updatedFields.toggleCount': { $exists: true } },
              { 'updateDescription.updatedFields.deleteCount': { $exists: true } },
            ],
          },
          {
            'fullDocument.server': new mongoose.Types.ObjectId(serverId),
          },
        ],
      },
    },
  ];

  const options = { fullDocument: 'updateLookup' };

  const changeStream = processModel.watch(filter, options);

  changeStream.on('change', async (change) => {
    if (change.updateDescription?.updatedFields?.restartCount) {
      console.log(`[STREAM] Process ${change.fullDocument.name} restarted`);
      // pm2 restart
      const res = await new Promise<void>((resolve, reject) => {
        pm2.restart(change.fullDocument.pm_id, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
      await processModel.updateOne({ _id: change.fullDocument._id }, { $set: { restartCount: 0, toggleCount: 0, deleteCount: 0 } });
    }
    if (change.updateDescription?.updatedFields?.toggleCount) {
      console.log(`[STREAM] Process ${change.fullDocument.name} stopped`);
      const processes = await processInfo();
      const process = processes.find((item) => item.pm_id === change.fullDocument.pm_id);
      let _status = process?.status;
      if (process) {
        const res = await new Promise<void>((resolve, reject) => {
          if (_status == 'online') {
            pm2.stop(process.pm_id, (err) => {
              if (err) {
                reject(err);
              }
              resolve();
              _status = 'stopped';
            });
          } else {
            pm2.restart(process.pm_id, (err) => {
              if (err) {
                reject(err);
              }
              resolve();
              _status = 'online';
            });
          }
        });
      }
      await processModel.updateOne({ _id: change.fullDocument._id }, { $set: { restartCount: 0, toggleCount: 0, status: _status, deleteCount: 0 } });
    }
    if (change.updateDescription?.updatedFields?.deleteCount) {
      console.log(`[STREAM] Process ${change.fullDocument.name} deleted`);
      const res = await new Promise<void>((resolve, reject) => {
        pm2.delete(change.fullDocument.pm_id, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    }
  });
};
