import SettingModel from '../models/setting.js';
import { ISetting } from '../types/setting.js';

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
  cachedSettings = ((await SettingModel.findOne({})) ?? _defaultSettings) as ISetting;
  cacheExpiration = Date.now() + 3 * 60 * 1000;

  return cachedSettings;
}
