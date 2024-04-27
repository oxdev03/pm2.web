import { defineConfig } from "cypress";
import { clearDB, connectTestDB, createUser } from "./cypress/utils/db";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("before:browser:launch", () => {
        connectTestDB();
      });
      on("task", {
        clearDB,
        createUser,
      });
    },
  },
});
