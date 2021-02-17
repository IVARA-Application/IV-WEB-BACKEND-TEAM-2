const ContactSchema = require("./user-schema");
const { logger, Errors } = require("./constants");

const addNewContactUsDocument = async (data) => {
  try {
    const document = await ContactSchema.create(data);
    logger.info("Contact Us Document has been stored");
    logger.info(document);
  } catch (error) {
    logger.error(error);
    throw Errors.INTERNAL_SERVER_ERROR;
  }
};

module.exports = {
  addNewContactUsDocument: addNewContactUsDocument,
};
