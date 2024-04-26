import si from "systeminformation";

import { IServerInfo } from "../types/info";

export default async function getServerInfo(): Promise<IServerInfo> {
  const mem = await si.mem();
  return {
    name: (process.env.SERVER_NAME || (await si.osInfo())?.hostname) ?? "",
    uuid: (await si.system())?.uuid || (await si.uuid())?.os || "",
    stats: {
      cpu: (await si.currentLoad())?.currentLoad ?? 0,
      memory: mem?.used ?? 0,
      memoryMax: mem?.total ?? 0,
      uptime: (await si.time())?.uptime * 1000 ?? 0,
    },
    heartbeatAt: Date.now(),
  };
}
