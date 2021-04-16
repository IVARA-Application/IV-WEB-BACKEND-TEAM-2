"use strict";

const { Router } = require("express");
const { disconnect } = require("../utilities/database");
const {
  adminAuthMiddleware,
} = require("../middlewares/authenticationMiddleware");
const logger = require("../utilities/logger");
const { verifyStudentLogin, addNewStudent } = require("./service");

const studentLoginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Pass control to service layer
    await verifyStudentLogin(username, password);
    // User was verified and token was generated
    res.json({
      success: true,
      message: `Student ${username} has been logged in.`,
    });
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

const studentRegisterController = async (req, res) => {
  try {
    const { name, email, code } = req.body;
    // Pass control to service layer
    res.json({
      success: true,
      message: "New student was added.",
      student: await addNewStudent(name, email, code),
    });
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

const app = Router();

module.exports = () => {
  app.post("/login", studentLoginController);
  app.post("/register", adminAuthMiddleware, studentRegisterController);

  return app;
};
