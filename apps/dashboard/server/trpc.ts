import { userModel } from "@pm2.web/mongoose-models";
import { TRPCError, initTRPC } from "@trpc/server";
import { createTRPCContext } from "./context";

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create();

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await userModel.findById(ctx.session.user.id);
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

  return next({
    ctx: {
      // infers the `session` as non-nullable
      user: user,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user?.acl?.admin && !ctx.user?.acl?.owner) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Owner/Admin permission required!" });
  }
  return next({ ctx });
});
export const ownerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user?.acl?.owner) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Owner permission required!" });
  }
  return next({ ctx });
});
