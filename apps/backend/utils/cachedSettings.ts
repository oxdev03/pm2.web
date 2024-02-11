

import { settingModel } from '@pm2.web/mongoose-models';
import { ISetting } from '@pm2.web/typings';

import { defaultSettings } from './constants.js';

let cachedSettings: ISetting | null = null;
let cacheExpiration: number = 0;

export async function getCachedSettings(): Promise<ISetting> {
  if (cachedSettings && cacheExpiration > Date.now()) {
    return cachedSettings;
  }

  // fetch the settings from your data source here
  const _defaultSettings = {
    ...defaultSettings,
    _id: '',
    logRetention: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // cache the fetched settings for 3 minutes
  cachedSettings = ((await settingModel.findOne({})) ?? _defaultSettings) as ISetting;
  cacheExpiration = Date.now() + 3 * 60 * 1000;

  return cachedSettings;
}
