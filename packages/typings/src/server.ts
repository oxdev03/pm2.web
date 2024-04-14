import { IProcess } from "./process";

interface IServer {
  _id: string;
  name: string;
  uuid: string;
  heartbeat: number;
  createdAt?: string;
  updatedAt: string;
  processes: IProcess[];
}

type IServerModel = Omit<IServer, "processes">;

export type { IServer, IProcess, IServerModel };
