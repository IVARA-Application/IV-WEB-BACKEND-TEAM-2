const jwt = require("jsonwebtoken");

const signJwt = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    issuer: "ivara",
    expiresIn: "2h",
  });
};

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { signJwt, verifyJwt };
