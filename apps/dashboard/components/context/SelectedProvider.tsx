import { IProcess, IServer } from "@pm2.web/typings";
import { useSession } from "next-auth/react";
import { createContext, useContext, useState } from "react";

import { SelectItem, StateSelectedItem } from "@/types/context";
import Access from "@/utils/access";
import { IPermissionConstants, PERMISSIONS } from "@/utils/permission";

interface SelectedContextType {
  selectedItem: StateSelectedItem;
  selectItem: SelectItem;
  selectedProcesses: IProcess[];
  selectedServers: IServer[];
  servers: IServer[];
}

const SelectedContext = createContext<SelectedContextType>({
  selectedItem: {
    servers: [],
    processes: [],
  },
  selectItem: () => {},
  selectedProcesses: [],
  selectedServers: [],
  servers: [],
}); // pass null as initial value

export function useSelected() {
  return useContext(SelectedContext);
}

export function SelectedProvider({ children, servers }: { children: React.ReactNode; servers: IServer[] }) {
  const { data: session } = useSession();
  const [selectedItem, setSelectedItem] = useState<StateSelectedItem>({
    servers: [],
    processes: [],
  });

  const selectItem: SelectItem = (items, type) => {
    const allProcesses = servers.flatMap((server) => server.processes.map((process) => process));
    if (type == "servers") {
      setSelectedItem({
        servers: items,
        processes: items.length > 0
          ? selectedItem.processes.filter((process) =>
              items.includes(allProcesses.find((item) => item._id == process)?.server || ""),
            )
          : [],
      });
    } else if (type == "processes") {
      setSelectedItem({
        servers: selectedItem.servers || [],
        processes: selectedItem.servers.length > 0
          ? items.filter((process) =>
              selectedItem.servers.includes(allProcesses.find((item) => item._id == process)?.server || ""),
            )
          : items,
      });
    }
  };

  const hasPermission = (processId: string, serverId: string, permission?: keyof IPermissionConstants) => {
    const user = session?.user;
    if (!user || !user.acl) return false;
    if (!user?.acl?.owner && !user?.acl?.admin) {
      const serverAccess = new Access(user.acl?.servers ?? []);
      if (permission) return serverAccess.getPerms(serverId, processId).has(PERMISSIONS[permission]);
      return !!serverAccess.getPermsValue(serverId, processId);
    }
    return true;
  };

  const selectedServers = servers?.filter(
    (server) => selectedItem?.servers?.includes(server._id) || selectedItem?.servers?.length === 0,
  );
  const selectedProcesses = selectedServers
    .flatMap((s) => s.processes)
    .filter(
      (process) =>
        (selectedItem?.processes?.includes(process._id) || !selectedItem?.processes?.length) &&
        hasPermission(process._id, process.server),
    );

  return (
    <SelectedContext.Provider value={{ selectedItem, selectedProcesses, selectedServers, selectItem, servers }}>
      {children}
    </SelectedContext.Provider>
  );
}
