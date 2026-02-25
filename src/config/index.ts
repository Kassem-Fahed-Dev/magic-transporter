/**
 * @module config
 * @description Application configuration loaded from environment variables.
 */

import dotenv from "dotenv";

dotenv.config();

/**
 * Application configuration object.
 * Values are loaded from environment variables with sensible defaults.
 *
 * @property {number} port - HTTP server port
 * @property {string} mongodbUri - MongoDB connection URI
 * @property {string} nodeEnv - Current environment (development, production, test)
 */
export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/magic-transporters",
  nodeEnv: process.env.NODE_ENV || "development",
};
