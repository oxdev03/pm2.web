type ILogType = "success" | "error" | "warning" | "info";

interface ILog {
  type: ILogType;
  message: string;
  createdAt: Date;
  _id: string;
}

type IProcessType =
  | "node"
  | "python"
  | "ruby"
  | "php"
  | "bash"
  | "go"
  | "dotnet"
  | "shell"
  | "java"
  | "other";

type IProcessStatus =
  | "online"
  | "stopping"
  | "stopped"
  | "launching"
  | "errored"
  | "offline"
  | "one-launch-status";

interface IProcess {
  _id: string;
  pm_id: number;
  server: string;
  name: string;
  type: IProcessType;
  logs?: ILog[];
  status: IProcessStatus;
  versioning: {
    url?: string;
    revision?: string;
    comment?: string;
    branch?: string;
    unstaged?: boolean;
  };
  toggleCount: number;
  restartCount: number;
  deleteCount: number;
  createdAt?: string;
  updatedAt: string;
}

type IProcessModel = IProcess;

export type {
  ILog,
  ILogType,
  IProcessType,
  IProcessStatus,
  IProcess,
  IProcessModel,
};
