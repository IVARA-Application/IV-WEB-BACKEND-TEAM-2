"use strict";

const { MongoClient } = require("mongodb");
const logger = require("./logger");

let db;
let client;

async function initializeClient() {
  client = await MongoClient.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ignoreUndefined: true,
  });

  return client.db();
}

module.exports = {
  // Establish a connection to MongoDB
  connect: async () => {
    if (!db) {
      db = await initializeClient();
      logger.info("Connected to MongoDB.");
    }

    return db;
  },
  // Disconnect from MongoDB
  disconnect: async () => {
    if (db) {
      await client.close();
      db = null;
      logger.info("Disconnected from MongoDB.");
    }
  },
};
