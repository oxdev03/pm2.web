import { defineConfig } from "cypress";
import { clearDB, connectTestDB, createUser } from "./cypress/utils/db";
import { addMatchImageSnapshotPlugin } from "@simonsmith/cypress-image-snapshot/plugin";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on);
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
