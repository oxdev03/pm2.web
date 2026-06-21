/* eslint-disable unicorn/no-process-exit, unicorn/prefer-top-level-await */
import { MongoMemoryReplSet } from "mongodb-memory-server";

async function start() {
  const mongod = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    instanceOpts: [{ port: 27018 }],
  });

  const uri = mongod.getUri();
  console.log(`\n======================================================`);
  console.log(`✅ In-Memory MongoDB is running at: ${uri}`);
  console.log(`======================================================\n`);

  process.stdin.resume(); // keep alive

  const cleanup = async () => {
    console.log(`\nShutting down in-memory database...`);
    await mongod.stop();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
