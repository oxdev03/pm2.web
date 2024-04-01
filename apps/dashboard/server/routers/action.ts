import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { processModel } from "@pm2.web/mongoose-models";
import { TRPCError } from "@trpc/server";
import Access from "@/utils/acess";
import { PERMISSIONS } from "@/utils/permission";

export const actionRouter = protectedProcedure
  .input(
    z.object({
      processId: z.string(),
      action: z.enum(["RESTART", "STOP", "DELETE"]),
    }),
  )
  .mutation(async (opts) => {
    const { processId, action } = opts.input;
    const { user } = opts.ctx;

    const process = await processModel.findById(processId);
    if (!process) throw new TRPCError({ code: "BAD_REQUEST", message: "Process not found!" });

    if (!user.acl.owner && !user.acl.admin) {
      if (
        !new Access(user.acl.servers)
          .getPerms(process.server.toString(), process._id.toString())
          .has(PERMISSIONS[action])
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Insufficient Permissions" });
      }
    }

    try {
      switch (action) {
        case "RESTART":
          await processModel.updateOne({ _id: process._id }, { $inc: { restartCount: 1 } });
          break;
        case "STOP":
          await processModel.updateOne({ _id: process._id }, { $inc: { toggleCount: 1 } });
          break;
        case "DELETE":
          await processModel.updateOne({ _id: process._id }, { $inc: { deleteCount: 1 } });
          break;
      }
    } catch (error) {
      console.error(error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed updating process document" });
    }

    return undefined;
  });

export type ActionRouter = typeof actionRouter;
