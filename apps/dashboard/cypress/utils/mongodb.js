import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 20_583,
  },
});

const uri = mongod.getUri();
console.log(`Database started: ${uri}`);

// eslint-disable-next-line no-undef
process.on("exit", async () => {
  await mongod.stop();
  console.log("[Database] Closed Connection!");
});
