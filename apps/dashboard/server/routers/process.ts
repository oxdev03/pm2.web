import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { processModel, statModel } from "@pm2.web/mongoose-models";
import { IProcess, IStat, IUser } from "@pm2.web/typings";
import { TRPCError } from "@trpc/server";
import Access from "@/utils/access";
import { PERMISSIONS } from "@/utils/permission";

export const processRouter = router({
  getLogs: protectedProcedure
    .input(z.object({ processId: z.string(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const process = await processModel.findById(input.processId);
      checkPermission(process, ctx.user, [PERMISSIONS.LOGS]);
      const limit = input.limit || 100;
      return process?.logs?.slice(process.logs.length - limit, process.logs.length);
    }),
  getStat: protectedProcedure.input(z.object({ processId: z.string() })).query(async ({ ctx, input }) => {
    const process = await processModel.findById(input.processId);
    checkPermission(process, ctx.user, [PERMISSIONS.MONITORING]);

    const stat = await statModel
      .findOne({ source: { process: process?._id, server: process?.server } })
      .sort({ timestamp: -1 })
      .lean();

    return stat;
  }),
});

const checkPermission = (process: IProcess | null, user: IUser, requiredPerms: number[]) => {
  if (!process) throw new TRPCError({ code: "BAD_REQUEST", message: "Process not found" });
  if (user.acl.admin || user.acl.owner) return;
  const userPerms = new Access(user?.acl?.servers || []).getPerms(process.server.toString(), process._id.toString());
  if (!userPerms.has(...requiredPerms)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Insufficient Permissions" });
  }
};
