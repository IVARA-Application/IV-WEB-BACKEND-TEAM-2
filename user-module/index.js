"use strict";
require("dotenv").config();

const express = require("express");
const { appengine_v1alpha } = require("googleapis");
const { logger } = require("./constants");
const {
  addNewContactUsDocument,
  generateLoginUrl,
  setGoogleToken,
} = require("./user-controller");
const app = express();

// Middlewares required by the app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes handled by the app
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
app.get("/user/login", async (req, res) => {
  res.redirect(generateLoginUrl());
});
app.get("/user/authcode", async (req, res) => {
  try {
    const data = await setGoogleToken(req.query);
    res.send(`Hi ${data.name}! Welcome to Canvas`);
  } catch (error) {
    logger.error(error);
    res.json({ status: 500, message: error.message });
  }
});

// module.exports = app;

app.listen(5000, () => {
  console.log("Started");
});
