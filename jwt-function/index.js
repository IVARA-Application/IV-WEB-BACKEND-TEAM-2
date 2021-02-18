const jwt = require("jsonwebtoken");

exports.handler = (event) => {
  if (event.operation === "sign") {
    return jwt.sign({ username: event.username }, process.env.JWT_SECRET);
  } else {
    return jwt.verify(event.token, process.env.JWT_SECRET);
  }
};
