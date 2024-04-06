import { router } from "../trpc";
import { actionRouter } from "./action";
import { processRouter } from "./process";
import { settingRouter } from "./settings";
import { userRouter } from "./user";

export const appRouter = router({
  action: actionRouter,
  setting: settingRouter,
  user: userRouter,
  process: processRouter,
});

export type AppRouter = typeof appRouter;
