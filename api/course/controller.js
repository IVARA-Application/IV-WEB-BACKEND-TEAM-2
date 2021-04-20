"use strict";

const { Router } = require("express");
const {
  studentAuthMiddleware,
} = require("../middlewares/authenticationMiddleware");
const logger = require("../utilities/logger");
const { fetchSubjectList, fetchUnits } = require("./service");

const subjectListHandler = async (req, res) => {
  try {
    // Pass control to service layer
    res.json(await fetchSubjectList(res.locals.user.email, req.params.skill));
  } catch (error) {
    logger.error(error);
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

const unitListHandler = async (req, res) => {
  try {
    // Pass control to service layer
    res.json(
      await fetchUnits(
        res.locals.user.email,
        req.params.skill,
        req.params.subject
      )
    );
  } catch (error) {
    logger.error(error);
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

const app = Router();

module.exports = () => {
  app.get("/:skill", studentAuthMiddleware, subjectListHandler);
  app.get("/:skill/:subject", studentAuthMiddleware, unitListHandler);

  return app;
};
