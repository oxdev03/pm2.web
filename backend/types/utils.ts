interface ProcessInfo {
  name: string;
  pm_id: number;
  stats: {
    cpu: number;
    memory: number;
    uptime: number;
  };
  status: 'online' | 'stopping' | 'stopped' | 'launching' | 'errored' | 'one-launch-status';
  type: string;
}

interface ServerInfo {
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

export type { ProcessInfo, ServerInfo };
