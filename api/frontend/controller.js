"use strict";

const { Router } = require("express");
const logger = require("../utilities/logger");
const { fetchSaticItem, fetchSignedUrl } = require("./service");

const fetchItemController = async (req, res) => {
  try {
    // Pass control to service layer
    res.json(await fetchSaticItem(req.path.item));
  } catch (error) {
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
    res.json({ url: await fetchSignedUrl(req.query.code) });
  } catch (error) {
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
