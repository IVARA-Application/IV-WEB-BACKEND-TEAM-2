const { Lambda, Credentials } = require("aws-sdk");
const { logger } = require("./constants");
const lambda = new Lambda({
  apiVersion: "2015-03-31",
  region: "ap-south-1",
  credentials: new Credentials({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  }),
});

const authenticate = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      throw Error("Token not found");
    }
    const lambdaPromise = lambda
      .invoke({
        FunctionName: "jwt-function",
        Payload: JSON.stringify({
          operation: "verify",
          token: token,
        }),
      })
      .promise();
    const responseData = await lambdaPromise;
    const responseObject = JSON.parse(responseData.Payload);
    if (responseObject.errorMessage) throw Error(responseObject.errorMessage);
    res.locals.username = responseObject.username;
    next();
  } catch (error) {
    logger.error(error);
    return res
      .status(403)
      .json({ status: false, message: "User token not found or invalid" });
  }
};

module.exports = authenticate;
