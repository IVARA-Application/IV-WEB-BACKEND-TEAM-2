"use strict";
const { S3, Credentials } = require("aws-sdk");
const CourseSchema = require("./schemas/course-schema");
const { logger, Errors } = require("./constants");
const mongoose = require("mongoose");

const s3 = new S3({
  apiVersion: "2006-03-01",
  region: "ap-south-1",
  credentials: new Credentials({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  }),
});

/**
 * Fetch Course details
 */
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

/**
 * Fetch Subject details
 * @param {*} subCourseName - The name of the subCourse
 * @param {*} subject - Optional. The name of the subject
 */
const fetchAllSubjects = async (subCourseName, subject) => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    // Populate the document
    const document = await CourseSchema.findOne({
      "subCourse.name": subCourseName,
    }).populate("subCourse.subjects");
    if (document === null) throw Errors.RESOURCE_NOT_FOUND_ERROR;

    if (subject) {
      // Find the relevant subCourse
      const subCourseElement = document.subCourse.filter(
        (element) => element.name === subCourseName
      );

      // Find the required subject
      let subjectElement = [];
      for (let i = 0; i < subCourseElement[0].subjects.length; i++) {
        if (subCourseElement[0].subjects[i].name === subject) {
          subjectElement = subCourseElement[0].subjects[i];
          break;
        }
      }
      if (subjectElement === []) throw Errors.RESOURCE_NOT_FOUND_ERROR;
      return subjectElement;
    }
    return document;
  } catch (error) {
    logger.error(error);
    if (typeof error.code === "number") throw error;
    throw Errors.INTERNAL_SERVER_ERROR;
  }
};

const fetchVideoUrl = async (objectName) => {
  try {
    await s3
      .headObject({
        Bucket: process.env.BUCKET_NAME,
        Key: objectName,
      })
      .promise();
    return await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.BUCKET_NAME,
      Key: objectName,
      Expires: 7200,
    });
  } catch (error) {
    logger.error(error);
    if (typeof error.code === "number") throw error;
    throw Errors.RESOURCE_NOT_FOUND_ERROR;
  }
};

module.exports = {
  fetchAllCourses: fetchAllCourses,
  fetchAllSubjects: fetchAllSubjects,
  fetchVideoUrl: fetchVideoUrl,
};
