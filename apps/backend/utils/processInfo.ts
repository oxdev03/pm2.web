import bytes from "bytes-iec";
import pm2 from "pm2";

import { IProcessInfo } from "../types/info";
import { Pm2ProcessDescription } from "../types/pm2";

const getProcessInfo = async (): Promise<IProcessInfo[]> => {
  const pm2List = await new Promise<Pm2ProcessDescription[]>(
    (resolve, reject) => {
      pm2.list((err, list) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(list as Pm2ProcessDescription[]);
      });
    },
  );

  const processList = pm2List
    .map((item) => {
      if (item.pm_id === undefined) return null;

      const usedHeapSize = item?.pm2_env?.axm_monitor?.["Used Heap Size"] || {
        value: "0",
        unit: "",
      };

      return {
        name: item.name || item.pm_id,
        pm_id: item.pm_id,
        stats: {
          cpu: item?.monit?.cpu || 0,
          memory: item?.monit?.memory || 0,
          heapUsed: bytes.parse(`${usedHeapSize.value}${usedHeapSize.unit}`),
          memoryMax: 0,
          uptime: Date.now() - (item?.pm2_env?.pm_uptime || 0),
        },
        status: item?.pm2_env?.status || "offline",
        type: item?.pm2_env?.exec_interpreter || "",
      };
    })
    .filter((item) => !!item) as IProcessInfo[];

  return processList;
};

export default getProcessInfo;
