import * as dotenv from "dotenv";

import LogCapture from "./handlers/capture-logs.js";
import connectDb from "./handlers/connect-db.js";
import onChange from "./handlers/on-change.js";
import updateData from "./handlers/update-data.js";
import { getCachedSettings } from "./utils/cached-settings.js";

dotenv.config();

connectDb(process.env.DB_URI);
const logCapture = new LogCapture();

async function createInterval() {
  const { polling } = await getCachedSettings();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const interval = setInterval(async () => {
    const settings = await getCachedSettings();
    await updateData(logCapture.clear(), settings);
    // if polling changed clear interval and create new one
    if (settings.polling.backend !== polling.backend) {
      clearInterval(interval);
      await createInterval();
    }
  }, polling.backend);
}

async function main() {
  logCapture.capture();
  const initialData = await updateData([], await getCachedSettings());
  onChange(initialData.server._id);
  await createInterval();
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  await main();
})();
