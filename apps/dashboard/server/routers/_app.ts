import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { actionRouter } from "./action";
import { settingRouter } from "./settings";
import { userRouter } from "./user";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "yay!"),
  action: actionRouter,
  setting: settingRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
