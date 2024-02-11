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
  createdAt: string;
  updatedAt: string;
};

export type { ISetting };
