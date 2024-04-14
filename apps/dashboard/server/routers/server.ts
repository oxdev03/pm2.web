import { PERMISSIONS } from "@/utils/permission";
import { processModel } from "@pm2.web/mongoose-models";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { protectedProcedure, router } from "../trpc";
import Access from "@/utils/access";
import { IUser } from "@pm2.web/typings";

export const serverRouter = router({
  getLogs: protectedProcedure
    .input(z.object({ processIds: z.array(z.string()), limit: z.number().optional().default(100) }))
    .query(async ({ ctx, input }) => {
      const { processIds, limit } = input;
      const query = { _id: { $in: processIds.map((x) => x) } };
      const processLogs = await processModel
        .find(query as any, {
          _id: 1,
          server: 1,
          logs: 1,
        })
        .lean();

      const filteredLogs = processLogs
        .filter((p) => hasPermission(p._id, p.server, ctx.user, [PERMISSIONS.LOGS]))
        .flatMap((p) => p.logs);

      filteredLogs.sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());

      return filteredLogs.slice(0, limit);
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
