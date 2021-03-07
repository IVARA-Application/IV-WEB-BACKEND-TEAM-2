const ContactSchema = require("./schemas/contact-us-schema");
const UserSchema = require("./schemas/user-schema");
const { Lambda, Credentials } = require("aws-sdk");
const mongoose = require("mongoose");
const argon2 = require("argon2");
const { google } = require("googleapis");
const { logger, Errors } = require("./constants");
const CustomUserSchema = require("./schemas/custom-user-schema");
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
const scopes = ["profile", "email"];
const lambda = new Lambda({
  apiVersion: "2015-03-31",
  region: "ap-south-1",
  credentials: new Credentials({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  }),
});

/**
 * Store the contact query
 * @param {*} data The contact query data
 */
const addNewContactUsDocument = async (data) => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    let promiseArray = [];
    promiseArray.push(ContactSchema.create(data));
    promiseArray.push(sendContactUsNotificationEmail(data));
    await Promise.all(promiseArray);
    logger.info("Contact Us Document has been stored");
  } catch (error) {
    logger.error(error);
    throw Errors.INTERNAL_SERVER_ERROR;
  }
};

/**
 * Send Contact Us Notification Email
 * @param {*} data The user data to include in the email
 */
const sendContactUsNotificationEmail = async (data) => {
  try {
    const lambdaPromise = lambda
      .invoke({
        FunctionName: "nodemailer-notification-function",
        InvocationType: "Event",
        Payload: JSON.stringify(data),
      })
      .promise();
    const response = await lambdaPromise;
    logger.info(response);
  } catch (error) {
    logger.error(error);
  }
};

/**
 * Generate a unique Google login URL for the user
 */
const generateLoginUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
};

/**
 * Set the token supplied by Google OAuth
 * @param {*} authObject The auth object from Google Signin
 */
const setToken = async (authObject) => {
  try {
    if (authObject.error) {
      console.log(authObject.error);
      throw Error("Access denied");
    }
    const { tokens } = await oauth2Client.getToken(authObject.code);
    oauth2Client.setCredentials(tokens);
    return await getGoogleUserProfile();
  } catch (error) {
    logger.error(error);
    if (error.message === "Could not get/create user profile") throw error;
    throw Error("Could not set token");
  }
};

/**
 * Get Google User profile and generate JWT
 */
const getGoogleUserProfile = async () => {
  try {
    let oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });
    let res = await oauth2.userinfo.get();
    await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    const dbData = await UserSchema.findOne({ username: res.data.email });
    if (dbData === null) {
      await UserSchema.create({
        username: res.data.email,
        firstname: res.data.given_name,
        lastname: res.data.family_name,
        email: res.data.email,
      });
    }
    const lambdaPromise = lambda
      .invoke({
        FunctionName: "jwt-function",
        Payload: JSON.stringify({
          operation: "sign",
          username: res.data.email,
        }),
      })
      .promise();
    const responseData = await lambdaPromise;
    return responseData.Payload;
  } catch (error) {
    logger.error(error);
    throw Error("Could not get/create user profile");
  }
};

const getUser = async (token) => {
  try {
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
    if (responseObject.errorMessage) throw responseObject.errorMessage;
    await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    return await UserSchema.findOne({
      username: responseObject.username,
    });
  } catch (error) {
    logger.error(error);
    throw { code: 403, message: "Could not validate user" };
  }
};

const userLogin = async (username, password) => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    const dbData = await CustomUserSchema.findOne({ username: username });
    if (dbData === null) throw Error("Could not find user in database");
    if (dbData.password && (await argon2.verify(dbData.password, password))) {
      const lambdaPromise = lambda
        .invoke({
          FunctionName: "jwt-function",
          Payload: JSON.stringify({
            operation: "sign",
            username: dbData.username,
          }),
        })
        .promise();
      const responseData = await lambdaPromise;
      const responseObject = JSON.parse(responseData.Payload);
      if (responseObject.errorMessage) throw responseObject.errorMessage;
      return responseObject;
    } else throw Error("Could not match hash");
  } catch (error) {
    logger.error(error);
    throw {
      code: 403,
      message: "User details are either invalid or not found",
    };
  }
};

const createCustomUser = async (data, token) => {
  try {
    if (token !== process.env.ADMIN_TOKEN) throw Error("Invalid admin token");
    await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    data.password = await argon2.hash(data.password);
    await CustomUserSchema.create(data);
  } catch (error) {
    logger.error(error);
    throw { code: 500, message: "Could not create a new custom user" };
  }
};

module.exports = {
  addNewContactUsDocument: addNewContactUsDocument,
  sendContactUsNotificationEmail: sendContactUsNotificationEmail,
  generateLoginUrl: generateLoginUrl,
  setGoogleToken: setToken,
  getUser: getUser,
  userLogin: userLogin,
  createCustomUser: createCustomUser,
};
