import { router } from "../trpc";
import { processRouter } from "./process";
import { serverRouter } from "./server";
import { settingRouter } from "./settings";
import { userRouter } from "./user";

export const appRouter = router({
  setting: settingRouter,
  user: userRouter,
  process: processRouter,
  server: serverRouter,
});

export type AppRouter = typeof appRouter;
