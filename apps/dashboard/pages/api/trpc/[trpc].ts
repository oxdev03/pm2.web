import * as trpcNext from "@trpc/server/adapters/next";

import { createTRPCContext } from "@/server/context";
import { appRouter } from "@/server/routers/_app";

// export API handler
// @link https://trpc.io/docs/v11/server/adapters
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
});
