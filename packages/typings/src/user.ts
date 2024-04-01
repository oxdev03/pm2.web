interface IAclProcess {
  process: string;
  perms: number;
}

interface IAclServer {
  server: string;
  perms: number;
  processes: IAclProcess[];
}

interface IAcl {
  owner: boolean;
  admin: boolean;
  servers: IAclServer[];
}

interface IOauth2 {
  provider: "github" | "google";
  providerUserId: string;
}

interface IUser {
  _id: string;
  email: string;
  name: string;
  password?: string;
  acl: IAcl;
  oauth2?: IOauth2;
  updatedAt?: string;
  createdAt?: string;
}

interface IUserModel extends IUser {}

interface IUserModelMethods {
  checkPassword: (password: string) => Promise<boolean>;
  toJSON: () => Omit<IUser, "password">;
}

export type {
  IUserModel,
  IUserModelMethods,
  IUser,
  IAcl,
  IOauth2,
  IAclServer,
  IAclProcess,
};
