/* eslint-disable unicorn/no-process-exit, unicorn/prefer-top-level-await */
import { spawn } from "node:child_process";

import { MongoMemoryServer } from "mongodb-memory-server";

async function start() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 20583,
    },
  });

  const uri = mongod.getUri();
  console.log(`Database started: ${uri}`);

  // Set DB_URI so Next.js can connect
  process.env.DB_URI = uri;

  // We spawn Next.js test server
  const child = spawn("pnpm", ["run", "test:server"], {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  // Handle termination
  const cleanup = async () => {
    child.kill();
    await mongod.stop();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", cleanup);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
