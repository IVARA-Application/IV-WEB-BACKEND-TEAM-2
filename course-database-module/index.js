"use strict";
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { logger } = require("./constants");
const {
  fetchAllCourses,
  fetchAllSubjects,
} = require("./course-database-controller");
const authenticate = require("./auth-middleware");

const app = express();

// Middlewares required by the app
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes handled by the app

// Fetch a list of all courses
app.get("/courses", authenticate, async (req, res) => {
  try {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "*",
    });
    res.json(await fetchAllCourses());
  } catch (error) {
    logger.error(error);
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});
app.get("/subjects", authenticate, async (req, res) => {
  try {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "*",
    });
    res.json(await fetchAllSubjects(req.query.course));
  } catch (error) {
    logger.error(error);
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});

module.exports = app;
app.listen(4000, () => {
  console.log("Started");
});
