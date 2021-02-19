"use strict";
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { logger } = require("./constants");
const {
  addNewContactUsDocument,
  generateLoginUrl,
  setGoogleToken,
} = require("./user-controller");
const app = express();

// Middlewares required by the app
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes handled by the app

// Accept and store Contact Us queries
app.post("/user/contact-us", async (req, res) => {
  try {
    await addNewContactUsDocument(req.body);
    res.json({ success: true, message: "Successfully stored the query" });
  } catch (error) {
    logger.error(error);
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});

// User Login endpoint
app.get("/user/login", async (req, res) => {
  res.redirect(generateLoginUrl());
});

// JWT Generation endpoint
app.post("/user", async (req, res) => {
  try {
    const data = await setGoogleToken(req.body);
    res.json({ success: true, token: data.substring(1, data.length - 1) });
  } catch (error) {
    logger.error(error);
    res.json({ status: 500, message: error.message });
  }
});

module.exports = app;
