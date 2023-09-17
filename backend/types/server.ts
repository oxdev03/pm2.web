type LogType = 'success' | 'error' | 'warning' | 'info';

interface Log {
  type: LogType;
  message: string;
  createdAt: string;
  _id: string;
}

interface IProcess {
  _id: string;
  pm_id: number;
  server: string;
  name: string;
  type: 'node' | 'python' | 'ruby' | 'php' | 'bash' | 'go' | 'dotnet' | 'shell' | 'java' | 'other';
  stats?: Omit<Stats, 'memoryMax'>;
  logs?: Log[];
  status: 'online' | 'stopping' | 'stopped' | 'launching' | 'errored' | 'offline';
  toggleCount: number;
  restartCount: number;
  deleteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Stats {
  cpu: number;
  memory: number;
  memoryMax: number;
  uptime: number;
}

interface IServer {
  _id: string;
  name: string;
  uuid: string;
  stats: Stats;
  createdAt: string;
  updatedAt: string;
  processes: IProcess[];
}

type MServer = Omit<IServer, 'processes' | 'createdAt' | 'updatedAt'> & {
  createdAt: Date;
  updatedAt: Date;
};

export type { IServer, IProcess, Stats, MServer, Log, LogType };
