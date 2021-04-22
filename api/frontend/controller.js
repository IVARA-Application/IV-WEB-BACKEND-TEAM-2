"use strict";

const { Router } = require("express");
const { disconnect } = require("../utilities/database");
const logger = require("../utilities/logger");
const { fetchSaticItem, fetchSignedUrl } = require("./service");

const fetchItemController = async (req, res) => {
  try {
    // Pass control to service layer
    res.json(await fetchSaticItem(req.path.item));
  } catch (error) {
    await disconnect();
    logger.error(error);
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

const fetchSignedUrlController = async (req, res) => {
  try {
    // Pass control to service layer
    res.json(await fetchSignedUrl(req.query.code));
  } catch (error) {
    await disconnect();
    logger.error(error);
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
  app.get("/video", fetchSignedUrlController);
  app.get("/:item", fetchItemController);

  return app;
};
