import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../trpc";
import { processModel, serverModel, statModel } from "@pm2.web/mongoose-models";

export const settingRouter = router({
  deleteAll: adminProcedure.mutation(async (opts) => {
    const servers = await serverModel.deleteMany({});
    const processes = await processModel.deleteMany({});
    const stats = await statModel.deleteMany({});
    return `Deleted ${servers.deletedCount} Servers, ${processes.deletedCount} Processes, ${stats.deletedCount} Stats`;
  }),
  truncateLogs: adminProcedure.mutation(async (opts) => {
    const processes = await processModel.updateMany({}, { $set: { logs: [] } });
    await statModel.deleteMany({});
    return `Truncated logs for ${processes.modifiedCount} processes`;
  }),
});

export type SettingRouter = typeof settingRouter;
