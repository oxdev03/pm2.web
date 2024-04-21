import { ProcessDescription } from "pm2";

export interface Pm2ProcessDescription extends ProcessDescription {
  pm2_env?: Pm2Env;
}

interface Pm2Env extends Exclude<ProcessDescription["pm2_env"], undefined> {
  versioning?: Partial<Versioning>;
  axm_monitor?: Partial<AxmMonitor>;
}

interface Versioning {
  type: string;
  url: string;
  revision: string;
  comment: string;
  unstaged: boolean;
  branch: string;
  remotes: string[];
  remote: string;
  branch_exists_on_remote: boolean;
  ahead: boolean;
  next_rev: string | null;
  prev_rev: string;
  update_time: string;
  tags: string[];
  repo_path: string;
}

interface AxmMonitor {
  [key: string]: {
    value: string | number;
    type: string;
    unit: string;
    historic: boolean;
  };
}
