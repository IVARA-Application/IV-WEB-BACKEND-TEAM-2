const jwt = require("jsonwebtoken");

exports.handler = (event, context) => {
  if (event.operation === "sign") {
    context.succeed(
      jwt.sign({ username: event.username }, process.env.JWT_SECRET)
    );
  } else {
    context.succeed(jwt.verify(event.token, process.env.JWT_SECRET));
  }
};
