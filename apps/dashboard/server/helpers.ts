import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "./routers/_app";
import superjson from "superjson";

export const getServerSideHelpers = () =>
  createServerSideHelpers({
    router: appRouter,
    ctx: {
      session: null,
    },
    transformer: superjson,
  });
