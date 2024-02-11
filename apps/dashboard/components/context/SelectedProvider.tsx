import { createContext, useContext, useEffect, useState } from "react";

import { IServer, SelectItem, StateSelectedItem } from "@pm2.web/typings";

interface SelectedContextType {
  selectedItem: StateSelectedItem;
  selectItem: SelectItem;
  servers: IServer[];
}

const SelectedContext = createContext<SelectedContextType>({
  selectedItem: {
    servers: [],
    processes: [],
  },
  selectItem: () => {},
  servers: [],
}); // pass null as initial value

export function useSelected() {
  return useContext(SelectedContext);
}

export function SelectedProvider({ children, servers }: { children: React.ReactNode; servers: IServer[] }) {
  const [selectedItem, setSelectedItem] = useState<StateSelectedItem>({
    servers: [],
    processes: [],
  });

  const selectItem: SelectItem = (items, type) => {
    const allProcesses = servers.map((server) => server.processes.map((process) => process)).flat();
    if (type == "servers") {
      setSelectedItem({
        servers: items,
        processes: items.length
          ? selectedItem.processes.filter((process) =>
              items.includes(allProcesses.find((item) => item._id == process)?.server || ""),
            )
          : [],
      });
    } else if (type == "processes") {
      setSelectedItem({
        servers: selectedItem.servers || [],
        processes: selectedItem.servers.length
          ? items.filter((process) =>
              selectedItem.servers.includes(allProcesses.find((item) => item._id == process)?.server || ""),
            )
          : items,
      });
    }
  };

  return <SelectedContext.Provider value={{ selectedItem, selectItem, servers }}>{children}</SelectedContext.Provider>;
}
