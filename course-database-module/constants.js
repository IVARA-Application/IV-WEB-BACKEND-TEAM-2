const bunyan = require("bunyan");
const logger = bunyan.createLogger({ name: "entrance-exam-module" });

const Errors = {
  INTERNAL_SERVER_ERROR: {
    code: 500,
    message:
      "Opps! Something went wrong on our end. We have our best minds working on it.",
  },
  RESOURCE_NOT_FOUND_ERROR: {
    code: 400,
    message: "Opps! The requested resource was not found.",
  },
};

module.exports = {
  logger: logger,
  Errors: Errors,
};
