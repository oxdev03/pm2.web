import si from "systeminformation";

import { ServerInfo } from "@pm2.web/typings";

export default async function getServerInfo(): Promise<ServerInfo> {
  const mem = await si.mem();
  return {
    name: (await si.osInfo())?.hostname ?? "",
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
