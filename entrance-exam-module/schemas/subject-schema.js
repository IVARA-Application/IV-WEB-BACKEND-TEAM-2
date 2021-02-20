const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
  //boardPhysics, jeePhysics, Aptitude
  name: {
    type: String,
  },
  chapters: [
    {
      //Chapter 1, Chapter 2
      name: String,
      videos: [
        {
          //Video 1.1 with descp and objectName to map to S3
          name: String,
          description: String,
          objectName: String,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("SubjectSchema", SubjectSchema, "subjects");
