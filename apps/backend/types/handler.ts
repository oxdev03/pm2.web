import { IServerModel } from "@pm2.web/typings";

import { IProcessInfo } from "./info";

interface QueuedLog {
  id: number;
  type: string;
  message: string;
  createdAt: Date;
}

interface Packet {
  process: { pm_id: number; name: string };
  data: string;
  event?: string;
}

interface UpdateDataResponse {
  server: IServerModel;
  processes: IProcessInfo[];
}

export type { Packet, QueuedLog, UpdateDataResponse };
