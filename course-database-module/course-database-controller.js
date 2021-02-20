const CourseSchema = require("./schemas/course-schema");
const { logger, Errors } = require("./constants");
const mongoose = require("mongoose");

const fetchAllCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    const documents = await CourseSchema.find({});
    return documents;
  } catch (error) {
    logger.error(error);
    throw Errors.INTERNAL_SERVER_ERROR;
  }
};

module.exports = {
  fetchAllCourses: fetchAllCourses,
};
