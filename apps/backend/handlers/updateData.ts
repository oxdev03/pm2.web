import { processModel, serverModel } from '@pm2.web/mongoose-models';
import { QueuedLog, UpdateDataResponse, ISetting } from '@pm2.web/typings';
import processInfo from '../utils/processInfo.js';
import serverInfo from '../utils/serverInfo.js';

export default async function updateData(queuedLogs: QueuedLog[], settings: ISetting): Promise<UpdateDataResponse> {
  const server = await serverInfo();
  const processes = await processInfo();
  // check if server exists
  let currentServer = await serverModel.findOne({ uuid: server.uuid });
  if (!currentServer) {
    // create server
    const newServer = new serverModel({
      name: server.name,
      uuid: server.uuid,
      stats: {
        cpu: server.stats.cpu,
        memory: server.stats.memory,
        memoryMax: server.stats.memoryMax,
        uptime: server.stats.uptime,
      },
    });
    await newServer.save().catch((err: Error) => {
      console.log(err);
    });
    currentServer = newServer;
  } else {
    // update server
    currentServer.stats = {
      cpu: server.stats.cpu,
      memory: server.stats.memory,
      memoryMax: server.stats.memoryMax,
      uptime: server.stats.uptime,
    };

    await currentServer.save().catch((err: Error) => {
      console.log(err);
    });
  }

  // check if process exists

  for (let i = 0; i < processes.length; i++) {
    const process = processes[i];
    const logs = queuedLogs
      .filter((log) => log.id === process.pm_id)
      .map((x) => {
        //@ts-ignore //TODO: fix this
        delete x.id;
        return x;
      });
    const processExists = await processModel.findOne({ pm_id: process.pm_id, server: currentServer._id }, { _id: 1 });
    if (!processExists) {
      // create process
      const newProcess = new processModel({
        pm_id: process.pm_id,
        server: currentServer._id,
        name: process.name,
        type: process.type,
        stats: {
          cpu: process.stats.cpu,
          memory: process.stats.memory,
          uptime: process.stats.uptime,
        },
        logs: logs,
        status: process.status,
        restartCount: 0,
        deleteCount: 0,
        toggleCount: 0,
      });
      await newProcess.save().catch((err: Error) => {
        console.log(err);
      });
    } else {
      await processModel.updateOne(
        { pm_id: process.pm_id, server: currentServer._id },
        {
          name: process.name,
          stats: {
            cpu: process.stats.cpu,
            memory: process.stats.memory,
            uptime: process.stats.uptime,
          },
          status: process.status,
          $push: {
            logs: {
              $each: logs,
              $slice: -settings.logRotation,
            },
          },
          updatedAt: new Date(),
        }
      );
    }
  }

  // delete not existing processes
  const deleted = await processModel.deleteMany({ server: currentServer._id, pm_id: { $nin: processes.map((p) => p.pm_id) } }).catch((err: Error) => {
    console.log(err);
  });
  if (deleted?.deletedCount) console.log(`Deleted ${deleted.deletedCount} processes`);

  return {
    server: currentServer,
    processes,
  };
}
