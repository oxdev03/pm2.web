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
        processes:
          items.length > 0
            ? selectedItem.processes.filter((process) =>
                items.includes(allProcesses.find((item) => item._id == process)?.server || ""),
              )
            : [],
      });
    } else if (type == "processes") {
      // If clearing selection (empty array), just clear
      if (items.length === 0) {
        setSelectedItem({
          servers: selectedItem.servers || [],
          processes: [],
        });
        return;
      }
      
      // Check if we're removing items (deselection scenario)
      const currentProcesses = selectedItem.processes || [];
      const isDeselecting = currentProcesses.length > items.length;
      
      if (isDeselecting) {
        // Find which processes were removed
        const removedProcesses = currentProcesses.filter((id: string) => !items.includes(id));
        
        // For each removed process, find all processes with the same name and remove them all
        const processesToRemove: string[] = [];
        removedProcesses.forEach((removedProcessId: string) => {
          const removedProcess = allProcesses.find((p) => p._id === removedProcessId);
          if (removedProcess) {
            // Find all processes with the same name (cluster)
            const clusterProcesses = allProcesses
              .filter((p) => p.name === removedProcess.name)
              .map((p) => p._id);
            processesToRemove.push(...clusterProcesses);
          }
        });
        
        // Remove duplicates and filter out the cluster processes
        const uniqueProcessesToRemove = new Set(processesToRemove.filter((id: string, index: number) => processesToRemove.indexOf(id) === index));
        const filteredProcesses = currentProcesses.filter((id: string) => !uniqueProcessesToRemove.has(id));
        
        setSelectedItem({
          servers: selectedItem.servers || [],
          processes: selectedItem.servers.length > 0
            ? filteredProcesses.filter((process: string) =>
                selectedItem.servers.includes(allProcesses.find((item) => item._id == process)?.server || ""),
              )
            : filteredProcesses,
        });
      } else {
        // Selection scenario - expand clusters as before
        const expandedProcesses: string[] = [];
        
        items.forEach((selectedProcessId) => {
          const selectedProcess = allProcesses.find((p) => p._id === selectedProcessId);
          if (selectedProcess) {
            // Find all processes with the same name
            const clusterProcesses = allProcesses
              .filter((p) => p.name === selectedProcess.name)
              .map((p) => p._id);
            expandedProcesses.push(...clusterProcesses);
          }
        });
        
        // Remove duplicates
        const uniqueExpandedProcesses = expandedProcesses.filter((id: string, index: number) => expandedProcesses.indexOf(id) === index);
        
        setSelectedItem({
          servers: selectedItem.servers || [],
          processes:
            selectedItem.servers.length > 0
              ? uniqueExpandedProcesses.filter((process) =>
                  selectedItem.servers.includes(allProcesses.find((item) => item._id == process)?.server || ""),
                )
              : uniqueExpandedProcesses,
        });
      }
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
