import pm2 from "pm2";

import { ProcessInfo } from "@pm2.web/typings";

const getProcessInfo = async (): Promise<ProcessInfo[]> => {
  const pm2List = await new Promise<pm2.ProcessDescription[]>(
    (resolve, reject) => {
      pm2.list((err, list) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(list);
      });
    },
  );

  const processList = pm2List
    .map((item) => {
      if (item.pm_id == undefined) return null;
      return {
        name: item.name || item.pm_id,
        pm_id: item.pm_id,
        stats: {
          cpu: item?.monit?.cpu || 0,
          memory: item?.monit?.memory || 0,
          uptime: Date.now() - (item?.pm2_env?.pm_uptime || 0),
        },
        status: item?.pm2_env?.status || "offline",
        type: item?.pm2_env?.exec_interpreter || "",
      };
    })
    .filter((item) => !!item) as ProcessInfo[];

  return processList;
};

export default getProcessInfo;
