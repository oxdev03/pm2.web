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
  getStats: protectedProcedure
    .input(z.object({ processId: z.string(), range: z.enum(["seconds"]) }))
    .query(async ({ ctx, input }) => {
      const process = await processModel.findById(input.processId);
      checkPermission(process, ctx.user, [PERMISSIONS.MONITORING]);

      const stats = await statModel
        .find({
          source: { process: process?._id, server: process?.server },
        })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();

      return stats;
    }),
  action: protectedProcedure
    .input(
      z.object({
        processId: z.string(),
        action: z.enum(["RESTART", "STOP", "DELETE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { action, processId } = input;
      const process = await processModel.findById(processId);
      if (!process) throw new TRPCError({ code: "BAD_REQUEST", message: "Process not found!" });

      checkPermission(process, ctx.user, [PERMISSIONS[action]]);

      try {
        switch (action) {
          case "RESTART":
            await processModel.updateOne({ _id: process._id }, { $inc: { restartCount: 1 } }, { timestamps: false });
            break;
          case "STOP":
            await processModel.updateOne({ _id: process._id }, { $inc: { toggleCount: 1 } }, { timestamps: false });
            break;
          case "DELETE":
            await processModel.updateOne({ _id: process._id }, { $inc: { deleteCount: 1 } }, { timestamps: false });
            break;
        }
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed updating process document" });
      }

      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 10_000));

      const filter = [
        {
          $match: {
            $and: [
              { operationType: { $in: ["update"] } },
              {
                "fullDocument._id": process._id,
              },
            ],
          },
        },
      ];

      /* Checks whether the backend did acknowledge the action, timeouts after 10 seconds */
      const options = { fullDocument: "updateLookup" };

      const changeStream = processModel.watch(filter, options);

      let doc = null;
      let success = false;

      while ((doc = await Promise.race([changeStream.next(), timeoutPromise]))) {
        if (doc?.updateDescription?.updatedFields) {
          const updatedField = Object.keys(doc?.updateDescription?.updatedFields);
          if (["restartCount", "toggleCount", "deleteCount"].find((s) => updatedField.includes(s))) {
            success = true;
            break;
          }
        }
      }

      await changeStream.close();

      return success;
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
