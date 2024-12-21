import { defineConfig } from "cypress";
import dotenv from "dotenv";

import { clearDB, createUser } from "./cypress/utils/db.js";
import connectDB from "./server/db/mongodb.js";
dotenv.config({ path: ".env.test" });

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on) {
      // implement node event listeners here
      on("before:browser:launch", () => {
        void connectDB();
      });
      on("task", {
        clearDB,
        createUser,
      });
    },
  },
});
