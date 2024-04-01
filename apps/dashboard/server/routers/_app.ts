import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { actionRouter } from "./action";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "yay!"),
  action: actionRouter,
});

export type AppRouter = typeof appRouter;
