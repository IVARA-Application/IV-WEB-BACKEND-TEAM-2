"use strict";
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { logger } = require("./constants");
const { fetchAllCourses } = require("./entrance-exam-controller");

const app = express();

// Middlewares required by the app
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes handled by the app

// Fetch a list of all courses
app.get("/courses", async (req, res) => {
  try {
    res.json(await fetchAllCourses());
  } catch (error) {
    logger.error(error);
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});

module.exports = app;

app.listen(4000, () => {
  console.log("4000");
});
