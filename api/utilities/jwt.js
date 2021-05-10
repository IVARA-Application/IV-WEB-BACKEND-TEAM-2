const jwt = require("jsonwebtoken");

/**
 * Signs the payload and generates a JWT
 * @param {any} payload The payload data to be signeds
 * @param {string} expiry Optional: Expires In value, defaults to '2h'
 * @returns The token string
 */
const signJwt = (payload, expiry = "2h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    issuer: "ivara",
    expiresIn: expiry,
  });
};

/**
 * Verifies the JWT
 * @param {string} token The token to be verified
 * @returns The verified payload
 */
const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { signJwt, verifyJwt };
