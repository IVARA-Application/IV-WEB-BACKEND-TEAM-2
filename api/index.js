"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("./utilities/logger");
const studentController = require("./student/controller");
const frontendController = require("./frontend/controller");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/student", studentController());
app.use("/frontend", frontendController());
// Central Error Handler
app.use(function errorHandler(err, req, res, next) {
  logger.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.json({
    success: false,
    message: "Something went wrong at the server.",
    details: err.message,
  });
});

module.exports = app;

app.listen(process.env.PORT, () => {
  logger.info(`Ivara Server started on Port ${process.env.PORT}`);
});
