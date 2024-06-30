import { processModel, serverModel, statModel } from "@pm2.web/mongoose-models";
import { IServer, IUser } from "@pm2.web/typings";
import mongoose from "mongoose";
import { z } from "zod";

import Access from "@/utils/access";
import { PERMISSIONS } from "@/utils/permission";

import { fetchSettings } from "../helpers";
import { protectedProcedure, router } from "../trpc";

export const serverRouter = router({
  getLogs: protectedProcedure
    .input(z.object({ processIds: z.array(z.string()), limit: z.number().optional().default(100) }))
    .query(async ({ ctx, input }) => {
      const { processIds, limit } = input;
      const processLogs = await processModel
        .find(
          { _id: { $in: processIds.map((p) => new mongoose.Types.ObjectId(p)) } },
          {
            _id: 1,
            server: 1,
            logs: 1,
          },
        )
        .lean();

      const filteredLogs = processLogs
        .filter((p) => hasPermission(p._id, p.server, ctx.user, [PERMISSIONS.LOGS]))
        .flatMap((p) => p.logs);

      filteredLogs.sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());

      return filteredLogs.slice(-limit);
    }),

  getStats: protectedProcedure
    .input(z.object({ processIds: z.array(z.string()), serverIds: z.array(z.string()), polling: z.number() }))
    .query(async ({ input }) => {
      const { processIds, serverIds, polling } = input;

      const processPipeline: Parameters<typeof statModel.aggregate>[0] = [
        {
          $match: {
            "source.process": { $in: processIds.map((p) => new mongoose.Types.ObjectId(p)) },
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $limit: 10 * processIds.length,
        },
        {
          $densify: {
            field: "timestamp",
            range: {
              step: polling,
              unit: "second",
              bounds: "full",
            },
          },
        },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$timestamp",
                unit: "second",
                binSize: polling,
              },
            },
            processRam: { $avg: "$memory" },
            processCpu: { $avg: "$cpu" },
            processUptime: { $avg: "$uptime" },
          },
        },
        {
          $limit: 10,
        },
      ];

      const serverPipeline: Parameters<typeof statModel.aggregate>[0] = [
        {
          $match: {
            "source.server": { $in: serverIds.map((p) => new mongoose.Types.ObjectId(p)) },
            "source.process": undefined,
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $limit: 10 * serverIds.length,
        },
        {
          $densify: {
            field: "timestamp",
            range: {
              step: polling,
              unit: "second",
              bounds: "full",
            },
          },
        },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$timestamp",
                unit: "second",
                binSize: polling,
              },
            },
            serverRam: { $avg: "$memory" },
            serverCpu: { $avg: "$cpu" },
            serverUptime: { $avg: "$uptime" },
          },
        },
        {
          $limit: 20,
        },
      ];

      const processStats = await statModel.aggregate(processPipeline);
      const serverStats = await statModel.aggregate(serverPipeline);

      const mergedStats = processStats.map((processStat) => {
        const correspondingServerStat = serverStats.find(
          (serverStat) => serverStat._id.toString() === processStat._id.toString(),
        );
        return { ...processStat, ...correspondingServerStat, _id: processStat._id || correspondingServerStat._id };
      });

      return {
        processUptime: mergedStats?.[0]?.processUptime || 0,
        serverUptime: mergedStats?.[0]?.serverUptime || 0,
        stats: mergedStats.reverse(),
      };
    }),

  getDashBoardData: protectedProcedure.input(z.boolean().optional()).query(async ({ input: excludeDaemon }) => {
    const settings = await fetchSettings();

    const servers = (await serverModel
      .find(
        {},
        {
          createdAt: 0,
        },
      )
      .lean()) as IServer[];

    const processes = await processModel
      .find(
        {},
        {
          logs: 0,
          stats: 0,
          createdAt: 0,
          restartCount: 0,
          deleteCount: 0,
          toggleCount: 0,
        },
      )
      .lean();

    console.log(`[DATABASE] ${servers.length} servers, ${processes.length} processes`);
    // override online status ,m, if last updatedAt > 10 seconds ago
    const updateInterval = settings.polling.backend + 3000;
    for (const process of processes) {
      if (process.status == "online" && new Date(process.updatedAt).getTime() < Date.now() - updateInterval) {
        process.status = "offline";
      }
    }

    for (const server of servers) {
      server.processes = processes.filter(
        (process) =>
          process.server.toString() == server?._id?.toString() &&
          (settings.excludeDaemon || excludeDaemon ? process.name != "pm2.web-daemon" : true),
      );
    }

    return { settings: settings, servers: servers };
  }),
});

const hasPermission = (processId: string, serverId: string, user: IUser, requiredPerms: number[]) => {
  if (user.acl.admin || user.acl.owner) return true;
  const userPerms = new Access(user?.acl?.servers || []).getPerms(serverId.toString(), processId.toString());
  if (!userPerms.has(...requiredPerms)) {
    return false;
  }

  return true;
};
