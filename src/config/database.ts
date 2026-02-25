/**
 * @module config/database
 * @description MongoDB connection management using Mongoose.
 */

import mongoose from "mongoose";
import { config } from "./index";

/**
 * Establishes connection to MongoDB using the configured URI.
 * Exits the process with code 1 if connection fails.
 *
 * @returns {Promise<void>} Resolves when the connection is established
 * @throws {Error} Logs the error and terminates the process on connection failure
 */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

/**
 * Closes the active MongoDB connection gracefully.
 *
 * @returns {Promise<void>} Resolves when the connection is closed
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
