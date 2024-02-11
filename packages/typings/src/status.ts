export type LogType = 'success' | 'error' | 'warning' | 'info';

export interface Log {
  type: LogType;
  message: string;
  createdAt: string;
  _id: string;
}

export interface Status {
  cpu: number;
  memory: number;
  onlineCount: number;
  uptime: number;
  logs: Log[];
}
