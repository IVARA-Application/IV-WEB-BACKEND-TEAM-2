const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("./subject-schema");

const CourseSchema = new Schema({
  //Entrace exams, Skill Development, Virtual Classes
  name: {
    type: String,
  },
  subCourse: [
    {
      //JEE, Management, Class 10th
      name: String,
      subjects: [
        {
          //jeePhysics, boardPhysics, Aptitude
          type: Schema.Types.ObjectId,
          ref: "SubjectSchema",
        },
      ],
    },
  ],
});

module.exports = mongoose.model("CourseSchema", CourseSchema, "courses");
