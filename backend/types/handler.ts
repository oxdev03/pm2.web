import { MServer } from './server.js';
import { ProcessInfo } from './utils.js';

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
  server: MServer;
  processes: ProcessInfo[];
}

export type { QueuedLog, UpdateDataResponse, Packet };
