const { connect, disconnect } = require("../utilities/database");

/**
 * Fetch the subject list array pertaining to the skill
 * @param {string} email The email of the student logged in
 * @param {string} skill The skill for which the subject list is wanted
 * @returns Subject List array
 */
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

/**
 * Fetch unit wise data of a subject under a skill
 * @param {string} email The email of the logged in user
 * @param {string} skill The skill which has the requied subject under it
 * @param {string} subject The subject for which units id required
 * @returns Unit data array of the subject
 */
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
  return content[student.class][subject] ? content[student.class][subject] : [];
};

module.exports = { fetchSubjectList, fetchUnits };
