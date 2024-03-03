import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 20583,
  },
});

const uri = mongod.getUri();
console.log(`Database started: ${uri}`);

process.on("exit", async () => {
  await mongod.stop();
  console.log("[Database] Closed Connection!")
});
