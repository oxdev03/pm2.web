import * as dotenv from 'dotenv';

import LogCapture from './handlers/captureLogs.js';
import connectDb from './handlers/connectDb.js';
import onChange from './handlers/onChange.js';
import updateData from './handlers/updateData.js';
import { getCachedSettings } from './utils/cachedSettings.js';

dotenv.config();

connectDb(process.env.DB_URI);
const logCapture = new LogCapture();

async function createInterval() {
  const currentPolling = (await getCachedSettings()).polling.backend;
  const interval = setInterval(async () => {
    await updateData(logCapture.clear(), await getCachedSettings());
    const settings = await getCachedSettings();
    // if polling changed clear interval and create new one
    if (settings.polling.backend !== currentPolling) {
      clearInterval(interval);
      await createInterval();
    }
  }, currentPolling);
}

async function main() {
  logCapture.capture();
  const initialData = await updateData([], await getCachedSettings());
  onChange(initialData.server._id);
  await createInterval();
}

(async () => {
  await main();
})();
