"use strict";

const { createLogger } = require("bunyan");

// Create a new logger
const logger = createLogger({ name: "ivara", stream: process.stdout });

module.exports = logger;
