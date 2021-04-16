"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("./utilities/logger");
const userController = require("./student/controller");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/student", userController());

module.exports = app;

app.listen(process.env.PORT, () => {
  logger.info(`Ivara Server started on Port ${process.env.PORT}`);
});
