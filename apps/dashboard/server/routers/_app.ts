import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { actionRouter } from "./action";
import { settingRouter } from "./settings";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "yay!"),
  action: actionRouter,
  setting: settingRouter,
});

export type AppRouter = typeof appRouter;
