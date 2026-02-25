/**
 * @module server
 * @description Application entry point.
 * Connects to MongoDB and starts the Express HTTP server.
 */

import "reflect-metadata";
import app from "./app";
import { config } from "./config";
import { connectDatabase } from "./config/database";

/**
 * Bootstraps the application: connects to the database,
 * then starts listening for incoming HTTP requests.
 *
 * @returns {Promise<void>} Resolves when the server is listening
 * @throws {Error} Exits process with code 1 on startup failure
 */
async function bootstrap(): Promise<void> {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`API Docs available at http://localhost:${config.port}/api-docs`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
