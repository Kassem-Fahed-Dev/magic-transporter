import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

/**
 * Sets up an in-memory MongoDB instance before all tests.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

/**
 * Clears all collections between tests for isolation.
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

/**
 * Tears down the in-memory MongoDB and closes connection after all tests.
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
