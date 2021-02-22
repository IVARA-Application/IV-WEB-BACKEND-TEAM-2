"use strict";
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { logger } = require("./constants");
const {
  addNewContactUsDocument,
  generateLoginUrl,
  setGoogleToken,
  getUser,
  sendContactUsNotificationEmail,
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
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "*",
    });
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});

// Google User Login endpoint
app.get("/user/glogin", async (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "*",
  });
  res.redirect(generateLoginUrl());
});

// Gooegle User JWT Generation endpoint
app.post("/user/google", async (req, res) => {
  try {
    const data = await setGoogleToken(req.body);
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, token: data.substring(1, data.length - 1) });
  } catch (error) {
    logger.error(error);
    res.json({ status: 500, message: error.message });
  }
});

// Replace token to get user profile
app.get("/user", async (req, res) => {
  try {
    const user = await getUser(req.headers.authorization);
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "*",
    });
    res.json({
      success: true,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    });
  } catch (error) {
    logger.error(error);
    res.json({ status: 500, message: error.message });
  }
});

module.exports = app;
