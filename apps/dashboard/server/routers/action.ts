import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const actionRouter = router({});

export type ActionRouter = typeof actionRouter;
