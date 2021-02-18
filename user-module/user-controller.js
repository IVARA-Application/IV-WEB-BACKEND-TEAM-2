const ContactSchema = require("./schemas/contact-us-schema");
const UserSchema = require("./schemas/user-schema");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const { logger, Errors } = require("./constants");
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
const scopes = ["profile", "email"];

const addNewContactUsDocument = async (data) => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    const document = await ContactSchema.create(data);
    logger.info("Contact Us Document has been stored");
    logger.info(document);
  } catch (error) {
    logger.error(error);
    throw Errors.INTERNAL_SERVER_ERROR;
  }
};

const generateLoginUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
};

const setToken = async (authObject) => {
  try {
    if (authObject.error) {
      console.log(authObject.error);
      throw Error("Access denied");
    }
    const { tokens } = await oauth2Client.getToken(authObject.code);
    oauth2Client.setCredentials(tokens);
    return await getUserProfile();
  } catch (error) {
    if (error.message === "Could not get/create user profile") throw error;
    throw Error("Could not set token");
  }
};

const getUserProfile = async () => {
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
    return res.data;
  } catch (error) {
    logger.error(error);
    throw Error("Could not get/create user profile");
  }
};

module.exports = {
  addNewContactUsDocument: addNewContactUsDocument,
  generateLoginUrl: generateLoginUrl,
  setGoogleToken: setToken,
};
