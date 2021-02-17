"use strict";
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { addNewContactUsDocument } = require("./user-controller");
const app = express();

// Middlewares required by the app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes handled by the app
app.post("/contact-us", async (req, res) => {
  try {
    await addNewContactUsDocument(req.body);
    res.json({ success: true, message: "Successfully stored the query" });
  } catch (error) {
    console.error(error);
    res
      .status(error.code || 500)
      .json({ success: false, message: error.message });
  }
});

mongoose
  .connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((_) => {
    module.exports = app;
  });
