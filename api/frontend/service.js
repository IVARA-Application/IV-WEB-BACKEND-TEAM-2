"use strict";

const { getSignedUrl } = require("../utilities/awsS3");
const { connect, disconnect } = require("../utilities/database");

/**
 * Fetch static items for the client
 * @param {string} item The item required
 * @returns The item asked for
 */
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

/**
 * Fetch a signed URL for the video asked for using the code
 * @param {string} code TThe code of the video
 * @returns The signed URL data with title
 */
const fetchSignedUrl = async (code) => {
  const data = await (await connect()).collection("videos").findOne({ code });
  if (data === null)
    // Throw error if data was not found
    throw {
      custom: true,
      code: 404,
      message: `Video code was not found in the database.`,
    };
  await disconnect();
  return { url: getSignedUrl(data.objectName), title: data.title };
};

module.exports = { fetchSaticItem, fetchSignedUrl };
