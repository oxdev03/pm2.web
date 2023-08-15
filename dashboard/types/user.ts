interface Process {
  process: string;
  perms: number;
}

interface Server {
  server: string;
  perms: number;
  processes: Process[];
}

interface Acl {
  owner: boolean;
  admin: boolean;
  servers: Server[];
}

interface Oauth2 {
  provider: 'github' | 'google';
  providerUserId: string;
}

interface IUser {
  _id: string;
  email: string;
  name: string;
  password?: string;
  acl: Acl;
  oauth2?: Oauth2;
  updatedAt?: string;
  createdAt?: string;
}

interface MUser extends Omit<IUser, 'updatedAt' | 'createdAt'> {
  updatedAt: Date;
  createdAt: Date;
}
interface MUserMethods {
  checkPassword: (password: string) => Promise<boolean>;
  toJSON: () => IUser extends { password: string } ? Omit<IUser, 'password'> : IUser;
}

export type { MUserMethods, IUser, MUser, Acl, Oauth2, Server, Process };
