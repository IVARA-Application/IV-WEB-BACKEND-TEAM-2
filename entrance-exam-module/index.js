"use strict";
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares required by the app
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
