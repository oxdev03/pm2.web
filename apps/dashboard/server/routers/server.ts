import { PERMISSIONS } from "@/utils/permission";
import { processModel } from "@pm2.web/mongoose-models";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const serverRouter = router({
  getLogs: protectedProcedure
    .input(z.object({ processIds: z.array(z.string()), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {}),
});
