/* eslint-disable no-undef, unicorn/no-process-exit, no-empty */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dummyScript = path.resolve(
  __dirname,
  "../../../scripts/dummy-process.js",
);

console.log("Starting dummy PM2 process...");
try {
  execSync(`npx pm2 start ${dummyScript} --name dummy-app`, {
    stdio: "inherit",
  });
} catch {
  console.log("PM2 dummy-app might already be running or failed to start.");
}

process.stdin.resume();

const cleanup = () => {
  console.log(`\nShutting down dummy PM2 process...`);
  try {
    execSync(`npx pm2 delete dummy-app`, { stdio: "ignore" });
    execSync(`npx pm2 kill`, { stdio: "ignore" });
  } catch {}
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
