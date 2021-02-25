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
    const documents = await CourseSchema.find({}).select({
      "subCourse.subjects": 0,
    });
    return documents;
  } catch (error) {
    logger.error(error);
    throw Errors.INTERNAL_SERVER_ERROR;
  }
};

const fetchAllSubjects = async (courseName) => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    const document = await CourseSchema.findOne({ name: courseName }).populate(
      "subCourse.subjects"
    );
    if (document === null) throw Errors.RESOURCE_NOT_FOUND_ERROR;
    return document;
  } catch (error) {
    logger.error(error);
    if (typeof error.code === "number") throw error;
    throw Errors.INTERNAL_SERVER_ERROR;
  }
};

module.exports = {
  fetchAllCourses: fetchAllCourses,
  fetchAllSubjects: fetchAllSubjects,
};
