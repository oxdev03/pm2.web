import { Log } from './status';

interface IProcess {
  _id: string;
  pm_id: number;
  server: string;
  name: string;
  type: string;
  stats?: Omit<Stats, 'memoryMax'>;
  logs?: Log[];
  status: 'online' | 'stopping' | 'stopped' | 'launching' | 'errored' | 'offline';
  toggleCount: number;
  restartCount: number;
  deleteCount: number;
  createdAt?: string;
  updatedAt: string;
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
  createdAt?: string;
  updatedAt: string;
  processes: IProcess[];
}

type MServer = Omit<IServer, 'processes'>;

type SelectItem = (items: string[], type: 'servers' | 'processes') => void;

type StateSelectedItem = {
  servers: string[];
  processes: string[];
};

export type { IServer,  IProcess, Stats, SelectItem, StateSelectedItem, MServer };
