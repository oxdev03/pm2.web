type ISetting = {
  _id: string;
  polling: {
    backend: number;
    frontend: number;
  };
  logRotation: number;
  logRetention: number;
  excludeDaemon: boolean;
  registrationCode: string;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
};

export type { ISetting };