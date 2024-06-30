import { userModel } from "@pm2.web/mongoose-models";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, protectedProcedure, router } from "../trpc";

const CustomPermissionSchema = z.object({
  userIds: z.array(z.string()),
  perms: z.array(
    z.object({
      server: z.string(),
      perms: z.number(),
      processes: z.array(
        z.object({
          process: z.string(),
          perms: z.number(),
        }),
      ),
    }),
  ),
});

export const userRouter = router({
  changePassword: protectedProcedure
    .input(
      z
        .object({
          oldPassword: z.string(),
          newPassword: z.string(),
          confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        }),
    )
    .mutation(async (opts) => {
      const { oldPassword, newPassword } = opts.input;
      const { user } = opts.ctx;

      if (!(await user.checkPassword(oldPassword))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Password is incorrect" });
      }

      user.password = newPassword;
      await user.save();

      return "Password updated successfully!";
    }),
  deleteAccount: protectedProcedure.input(z.object({ password: z.string() })).mutation(async (opts) => {
    const { password } = opts.input;
    const { user } = opts.ctx;
    if (!(await user.checkPassword(password))) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Password is incorrect" });
    }
    await userModel.findByIdAndDelete(user._id);
    return "Deleted User";
  }),
  unlinkOAuth2: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx;
    if (!user.oauth2?.provider) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Account is not linked to an OAuth2 Provider" });
    }

    const currentProvider = user.oauth2?.provider;
    user.oauth2 = undefined;
    await user.save();

    return `${currentProvider?.toLocaleUpperCase()} OAuth2 unlinked`;
  }),
  deleteUser: adminProcedure.input(z.object({ userId: z.string() })).mutation(async ({ input, ctx }) => {
    const { userId } = input;
    const authUser = ctx.user;

    const user = await userModel.findById(userId);

    if (!user) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "User doesn't exists" });
    }

    if (user.acl?.owner) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Owner cannot be deleted" });
    }
    if (user.acl?.admin && !authUser.acl?.owner) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Owner has higher permission than authenticated user." });
    }

    try {
      await userModel.findByIdAndDelete(userId);
      return "User deleted successfully";
    } catch {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed deleting user." });
    }
  }),
  updateRole: adminProcedure
    .input(z.object({ userId: z.string(), role: z.enum(["OWNER", "ADMIN", "CUSTOM", "NONE"]) }))
    .mutation(async ({ ctx, input }) => {
      const { userId, role } = input;
      const authUser = ctx.user;
      const user = await userModel.findById(userId);

      if (!user) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User doesn't exists" });
      }

      if (user.acl?.owner && !authUser.acl?.owner) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient permission to change role of owner" });
      }

      if (authUser.acl.admin && !authUser.acl.owner && role == "OWNER") {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient permission to change role to ${role}` });
      }

      if (authUser._id.toString() == user._id.toString() && user.acl?.owner && role != "OWNER") {
        // check if other owners exist
        const owners = await userModel.find({ "acl.owner": true });
        if (owners.length <= 1) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Their needs to be at least one owner." });
        }
      }

      user.acl = {
        owner: role === "OWNER",
        admin: role === "ADMIN",
        servers: [],
      };
      await user.save().catch((error) => console.error(error));
      return "Updated role successfully";
    }),
  setCustomPermission: adminProcedure.input(CustomPermissionSchema).mutation(async ({ input }) => {
    const { userIds, perms } = input;
    const users = await userModel.find({ _id: { $in: userIds } });
    // check if users exists
    if (users.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Users not found" });
    }

    // remove process if perms equals to server perms => save db storage
    const filteredPerms = perms.filter((server) => {
      server.processes = server.processes.filter((process) => !(process.perms === server.perms));
      return server.processes.length > 0 || server.perms !== 0;
    });

    for (const user of users) {
      user.acl.servers = filteredPerms;
      await user.save().catch((err) => console.error(err));
    }

    return "Updated permissions successfully";
  }),
  getUsers: adminProcedure.query(async () => {
    const users = await userModel
      .find(
        {},
        {
          password: 0,
          updatedAt: 0,
        },
      )
      .lean();

    return users;
  }),
});

export type userRouter = typeof userRouter;
