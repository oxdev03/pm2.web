import connectDB from "@/middleware/mongodb";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerAuthSession } from "./auth";
import { Session } from "next-auth";

type CreateContextOptions = {
  session: Session | null;
};
/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
  };
};
/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  await connectDB();

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};
