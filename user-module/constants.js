const bunyan = require("bunyan");
const logger = bunyan.createLogger({ name: "user-module" });

const Errors = {
  INTERNAL_SERVER_ERROR: {
    code: 500,
    message:
      "Opps! Something went wrong on our end. We have our best minds working on it.",
  },
};

module.exports = {
  logger: logger,
  Errors: Errors,
};
