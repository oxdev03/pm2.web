import { boolean, z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../trpc";
import { processModel, serverModel, settingModel, statModel } from "@pm2.web/mongoose-models";
import { defaultSettings } from "@/utils/constants";
import { ISetting } from "@pm2.web/typings";
import { fetchSettings } from "../helpers";

export const settingRouter = router({
  deleteAll: adminProcedure.mutation(async (opts) => {
    const servers = await serverModel.deleteMany({});
    const processes = await processModel.deleteMany({});
    const stats = await statModel.deleteMany({});
    return `Deleted ${servers.deletedCount} Servers, ${processes.deletedCount} Processes, ${stats.deletedCount} Stats`;
  }),
  deleteLogs: adminProcedure.mutation(async (opts) => {
    const processes = await processModel.updateMany({}, { $set: { logs: [] } });
    await statModel.deleteMany({});
    return `Deleted logs for ${processes.modifiedCount} processes`;
  }),
  updateSetting: adminProcedure
    .input(
      z.object({
        polling: z.object({
          frontend: z.number(),
          backend: z.number(),
        }),
        logRotation: z.number(),
        registrationCode: z.string().length(6),
        excludeDaemon: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const setting = await settingModel.findOne({});
      if (!setting) {
        // create new setting
        const newSetting = new settingModel({ ...defaultSettings, ...input });
        await newSetting.save();
        return "Configuration updated successfully";
      }

      setting.polling = input.polling;
      setting.logRotation = input.logRotation;
      setting.registrationCode = input.registrationCode;
      setting.excludeDaemon = input.excludeDaemon;

      await setting.save();
      return "Configuration updated successfully";
    }),
  getSettings: protectedProcedure.query(async () => {
    const settings = await fetchSettings();
    return settings;
  }),
  registrationCodeRequired: publicProcedure.query(async () => {
    const settings = await fetchSettings();
    return !!settings?.registrationCode;
  }),
});

export type SettingRouter = typeof settingRouter;
