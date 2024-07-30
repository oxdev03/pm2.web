import { IProcessStatus } from "@pm2.web/typings";

interface IProcessInfo {
  name: string;
  pm_id: number;
  stats: {
    cpu: number;
    memory: number;
    heapUsed: number;
    memoryMax: number;
    uptime: number;
  };
  versioning: {
    url?: string;
    revision?: string;
    comment?: string;
    branch?: string;
    unstaged?: boolean;
  };
  status: IProcessStatus;
  type: string;
}

interface IServerInfo {
  name: string;
  uuid: string;
  stats: {
    cpu: number;
    memory: number;
    memoryMax: number;
    uptime: number;
  };
  heartbeatAt: number;
}

export type { IProcessInfo, IServerInfo };
