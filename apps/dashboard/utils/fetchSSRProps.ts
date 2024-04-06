import connectDB from "@/middleware/mongodb";
import { processModel, serverModel, settingModel, userModel } from "@pm2.web/mongoose-models";
import { IServer, ISetting } from "@pm2.web/typings";

import { defaultSettings } from "./constants";

export async function fetchServer(excludeDaemon?: boolean): Promise<IServer[]> {
  await connectDB();

  const _servers = await serverModel
    .find(
      {},
      {
        createdAt: 0,
      },
    )
    .lean();

  const servers = JSON.parse(JSON.stringify(_servers));

  const processes = await processModel
    .find(
      {},
      {
        logs: 0,
        stats: 0,
        createdAt: 0,
        restartCount: 0,
        deleteCount: 0,
        toggleCount: 0,
      },
    )
    .lean();

  const settings = await fetchSettings();

  console.log(`[DATABASE] ${servers.length} servers, ${processes.length} processes`);
  // override online status ,m, if last updatedAt > 10 seconds ago
  const updateInterval = settings.polling.backend + 3000;
  for (let i = 0; i < processes.length; i++) {
    if (processes[i].status == "online" && new Date(processes[i].updatedAt).getTime() < Date.now() - updateInterval) {
      processes[i].status = "offline";
    }
  }

  for (let i = 0; i < servers.length; i++) {
    servers[i].processes = processes.filter(
      (process) =>
        process.server.toString() == servers[i]?._id?.toString() &&
        (excludeDaemon ? process.name != "pm2.web-daemon" : true),
    );
  }

  return JSON.parse(JSON.stringify(servers));
}

export async function fetchUser() {
  await connectDB();
  const users = await userModel
    .find(
      {},
      {
        _id: 1,
        acl: 1,
      },
    )
    .lean();
  return JSON.parse(JSON.stringify(users));
}

export async function fetchSettings(): Promise<ISetting> {
  await connectDB();
  const settings = await settingModel
    .findOne(
      {},
      {
        _id: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    )
    .lean();
  return settings ? JSON.parse(JSON.stringify(settings)) : defaultSettings;
}
