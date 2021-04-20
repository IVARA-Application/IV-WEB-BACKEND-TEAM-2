const { connect, disconnect } = require("../utilities/database");

const fetchSubjectList = async (email, skill) => {
  const student = await (await connect())
    .collection("students")
    .findOne({ email }, { projection: { class: 1, _id: 0 } });
  if (student === null)
    throw {
      custom: true,
      code: 404,
      message: `Student with email ${email} was not found in the database.`,
    };
  const courseData = await (await connect())
    .collection("courses")
    .findOne({ skill }, { projection: { content: 1, _id: 0 } });
  const content = courseData["content"];
  await disconnect();
  return content[student.class] ? content[student.class].subjectList : [];
};

const fetchUnits = async (email, skill, subject) => {
  const student = await (await connect())
    .collection("students")
    .findOne({ email }, { projection: { class: 1, _id: 0 } });
  if (student === null)
    throw {
      custom: true,
      code: 404,
      message: `Student with email ${email} was not found in the database.`,
    };
  const courseData = await (await connect())
    .collection("courses")
    .findOne({ skill }, { projection: { content: 1, _id: 0 } });
  const content = courseData["content"];
  await disconnect();
  return content[student.class] ? content[student.class][subject] : [];
};

module.exports = { fetchSubjectList, fetchUnits };
