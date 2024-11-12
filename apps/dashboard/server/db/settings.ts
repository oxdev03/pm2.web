import { settingModel } from "@pm2.web/mongoose-models";
import { ISetting } from "@pm2.web/typings";

export const defaultSettings = {
  polling: { backend: 3000, frontend: 3000 },
  excludeDaemon: false,
  logRotation: 500,
  registrationCode: "",
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
