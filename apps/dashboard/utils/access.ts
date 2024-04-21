import { IAclServer } from "@pm2.web/typings";

import { Permission } from "./permission";

class Access {
  private userPerms: IAclServer[] = [];
  constructor(userPerms: IAclServer[] = []) {
    this.userPerms = userPerms;
  }

  public getPermsValue(server: string, process: string) {
    const serverPerms = this.userPerms.find((x) => x.server.toString() === server);
    if (serverPerms == undefined) return 0;
    const processPerms = serverPerms.processes.find((x) => x.process.toString() === process);
    if (processPerms == undefined) return serverPerms.perms;
    return processPerms.perms;
  }

  public getPerms(server: string, process: string) {
    const value = this.getPermsValue(server, process);
    return new Permission(value);
  }
}

export default Access;
