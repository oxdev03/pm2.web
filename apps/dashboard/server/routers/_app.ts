import { router } from "../trpc";
import { processRouter } from "./process";
import { settingRouter } from "./settings";
import { userRouter } from "./user";

export const appRouter = router({
  setting: settingRouter,
  user: userRouter,
  process: processRouter,
});

export type AppRouter = typeof appRouter;
