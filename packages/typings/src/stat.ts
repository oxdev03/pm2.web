interface IStat {
  timestamp: string;
  cpu: number;
  memory: number;
  heapUsed: number;
  memoryMax: number;
  uptime: number;
  source: {
    process: string;
    server: string;
  };
}

type IStatModel = IStat;

export type { IStat, IStatModel };
