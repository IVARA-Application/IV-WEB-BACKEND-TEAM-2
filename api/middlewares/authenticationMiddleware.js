"use strict";

const { connect, disconnect } = require("../utilities/database");
const { verifyJwt } = require("../utilities/jwt");
const logger = require("../utilities/logger");

const studentAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    // Verify token
    if (token) {
      const decodedData = verifyJwt(token.split(" ")[1]);
      if (!decodedData)
        throw {
          custom: true,
          code: 403,
          message:
            "Could not verify token. Student is forbidden from doing this action.",
        };
      res.locals.user = decodedData;
      return next();
    }
    throw {
      custom: true,
      code: 403,
      message:
        "Could not find Authorization header. Student is forbidden from doing this action.",
    };
  } catch (error) {
    logger.error(error);
    res.status(403).json({ success: false, message: error.message });
  }
};

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    // Verify token
    if (token) {
      if (
        (await (await connect())
          .collection("tokens")
          .findOne({ token: token.split(" ")[1] })) === null
      )
        throw {
          custom: true,
          code: 403,
          message:
            "Could not verify admin token. User is forbidden from doing this admin action.",
        };
      await disconnect();
      return next();
    }
    throw {
      custom: true,
      code: 403,
      message:
        "Could not find Authorization header. User is forbidden from doing this admin action.",
    };
  } catch (error) {
    logger.error(error);
    await disconnect();
    if (error.custom) {
      return res
        .status(error.code)
        .json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: "Something went wrong at the server." });
  }
};

module.exports = { studentAuthMiddleware, adminAuthMiddleware };
