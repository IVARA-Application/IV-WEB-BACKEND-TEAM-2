const yup = require("yup");
const { logger } = require("./constants");

const validate = (location, schema) => {
  return async (req, res, next) => {
    try {
      switch (location) {
        case "body":
          await schema.isValid(req.body);
          break;
        case "query":
          await schema.isValid(req.query);
          break;
      }
      next();
    } catch (error) {
      logger.error(error);
      res.status(400).json({
        success: false,
        message: "Bad user input. Please recheck your input and try again.",
      });
    }
  };
};

module.exports = {
  validate: validate,
};
