import { settingModel } from "@pm2.web/mongoose-models";
import { ISetting } from "@pm2.web/typings";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import connectDB from "@/middleware/mongodb";
import { defaultSettings } from "@/utils/constants";

import { appRouter } from "./routers/_app";

export const getServerSideHelpers = async () => {
  await connectDB();
  return createServerSideHelpers({
    router: appRouter,
    ctx: {
      session: null,
    },
    transformer: superjson,
  });
};

export const fetchSettings = async () => {
  const settings =
    ((await settingModel
      .findOne(
        {},
        {
          _id: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      )
      .lean()) as ISetting) || defaultSettings;

  return settings;
};
