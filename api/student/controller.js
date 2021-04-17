"use strict";

const { Router } = require("express");
const path = require("path");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(process.env.FILE_SIZE) | 10) * 1000 * 1000 },
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname);
    if (ext !== ".csv")
      return callback(new Error("Only CSV files are alowed."));
    callback(null, true);
  },
});
const { disconnect } = require("../utilities/database");
const {
  adminAuthMiddleware,
} = require("../middlewares/authenticationMiddleware");
const logger = require("../utilities/logger");
const {
  verifyStudentLogin,
  addNewStudent,
  addNewStudentsInBulk,
} = require("./service");

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
    const { name, email, studentClass, section, roll, code } = req.body;
    // Pass control to service layer
    res.json({
      success: true,
      message: "New student was added.",
      student: await addNewStudent(
        name,
        email,
        studentClass,
        section,
        roll,
        code
      ),
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

const bulkStudentRegisterController = async (req, res) => {
  try {
    // Pass control to service layer
    res.set("Content-Type", "text/csv");
    res.end(await addNewStudentsInBulk(req.file.buffer, req.body.code));
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
  app.post(
    "/bulkregister",
    adminAuthMiddleware,
    upload.single("record"),
    bulkStudentRegisterController
  );

  return app;
};
