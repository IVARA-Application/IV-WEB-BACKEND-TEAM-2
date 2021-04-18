"use strict";

const { Router } = require("express");
const logger = require("../utilities/logger");
const { fetchSaticItem } = require("./service");

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

const app = Router();

module.exports = () => {
  app.get("/:item", fetchItemController);

  return app;
};
