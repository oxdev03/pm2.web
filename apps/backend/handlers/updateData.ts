import { processModel, serverModel, statModel } from "@pm2.web/mongoose-models";
import { ISettingModel } from "@pm2.web/typings";

import { QueuedLog, UpdateDataResponse } from "../types/handler.js";
import processInfo from "../utils/processInfo.js";
import serverInfo from "../utils/serverInfo.js";

export default async function updateData(
  queuedLogs: QueuedLog[],
  settings: ISettingModel,
): Promise<UpdateDataResponse> {
  const server = await serverInfo();
  const processes = await processInfo();
  const timestamp = new Date();
  // check if server exists
  let currentServer = await serverModel.findOne({ uuid: server.uuid });
  if (currentServer) {
    currentServer.name = server.name;
    currentServer.heartbeat = Date.now();
    currentServer.save();
  } else {
    // create server
    const newServer = new serverModel({
      name: server.name,
      uuid: server.uuid,
    });
    await newServer.save().catch((err: Error) => {
      console.log(err);
    });
    currentServer = newServer;
  }

  const processStats = [];

  for (const process of processes) {
    if (!process) continue;
    const logs = queuedLogs
      .filter((log) => log.id === process.pm_id)
      .map((x) => {
        //@ts-expect-error id needs to be optional
        delete x.id;
        return x;
      });
    const processQuery = { pm_id: process.pm_id, server: currentServer._id };
    let processExists = await processModel.findOne(processQuery, { _id: 1 });
    if (processExists) {
      processExists = await processModel.findOne(processQuery, { _id: 1 });
      await processModel.updateOne(processQuery, {
        name: process.name,
        status: process.status,
        versioning: process.versioning,
        $push: {
          logs: {
            $each: logs,
            $slice: -settings.logRotation,
          },
        },
      });
    } else {
      // create process
      const newProcess = new processModel({
        pm_id: process.pm_id,
        server: currentServer._id,
        name: process.name,
        type: process.type,
        logs: logs,
        status: process.status,
        versioning: process.versioning,
        restartCount: 0,
        deleteCount: 0,
        toggleCount: 0,
      });
      await newProcess.save().catch((err: Error) => {
        console.log(err);
      });
    }

    processStats.push({
      source: {
        server: currentServer._id,
        process: processExists?._id,
      },
      cpu: process.stats.cpu,
      memory: process.stats.memory,
      heapUsed: process.stats.heapUsed,
      memoryMax: process.stats.memoryMax || server.stats.memoryMax,
      uptime: process.stats.uptime,
      timestamp: timestamp,
    });
  }

  // insert stats
  const stats = [
    {
      source: {
        server: currentServer._id,
      },
      cpu: server.stats.cpu,
      memory: server.stats.memory,
      heapUsed: 0,
      memoryMax: server.stats.memoryMax,
      uptime: server.stats.uptime,
      timestamp: timestamp,
    },
    ...processStats,
  ];

  await statModel.insertMany(stats);

  // delete not existing processes
  const deletedProcess = await processModel
    .deleteMany({
      server: currentServer._id,
      pm_id: { $nin: processes.map((p) => p.pm_id) },
    })
    .catch((err: Error) => {
      console.log(err);
    });
  if (deletedProcess?.deletedCount)
    console.log(`Deleted ${deletedProcess.deletedCount} processes`);

  return {
    server: currentServer,
    processes,
  };
}
