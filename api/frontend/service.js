"use strict";

const { connect, disconnect } = require("../utilities/database");

const fetchSaticItem = async (item) => {
  // Search database by for FAQ data
  const data = await (await connect())
    .collection("frontend")
    .findOne({ name: item });
  if (data === null)
    // Throw error if data was not found
    throw {
      custom: true,
      code: 404,
      message: `FAQ data was not found in the database.`,
    };
  await disconnect();
  return data.content;
};

module.exports = { fetchSaticItem };
