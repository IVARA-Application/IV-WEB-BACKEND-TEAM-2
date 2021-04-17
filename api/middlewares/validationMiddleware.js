const logger = require("../utilities/logger");

const validationMiddleware = (location, schema) => {
  return async (req, res, next) => {
    try {
      let _location;
      switch (location) {
        case "body":
          _location = req.body;
          break;
        case "query":
          _location = req.query;
          break;
      }
      await schema.validate(_location);
      next();
    } catch (error) {
      logger.error(error);
      await disconnect();
      if (error.custom) {
        return res
          .status(error.code)
          .json({ success: false, message: error.message });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = { validationMiddleware };
