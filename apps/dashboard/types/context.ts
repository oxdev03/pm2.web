type SelectItem = (items: string[], type: "servers" | "processes") => void;

type StateSelectedItem = {
  servers: string[];
  processes: string[];
};

export type { SelectItem, StateSelectedItem };
