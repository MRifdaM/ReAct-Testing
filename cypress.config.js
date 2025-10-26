import { defineConfig } from "cypress";
const { execSync } = require('child_process');

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:8000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        resetDatabase() {
          console.log("Running migrate:fresh --seed for testing DB...");
          try {
              execSync('php artisan migrate:fresh --seed --env=testing');
              console.log("Database reset successful.");
              return null; 
          } catch (error) {
              console.error("Database reset failed:", error.stderr.toString());
              throw new Error(`Database reset failed: ${error.stderr.toString()}`);
          }
        }
      });
    },
  },
});

