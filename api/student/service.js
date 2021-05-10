"use strict";

const { nanoid } = require("nanoid");
const converter = require("json-2-csv");
const argon2 = require("argon2");
const { connect, disconnect } = require("../utilities/database");
const logger = require("../utilities/logger");
const { studentMongodbSchema } = require("./schemas");
const { signJwt } = require("../utilities/jwt");

/**
 * Verify username and password and generate a JWT
 * @param {string} username
 * @param {string} password
 */
const verifyStudentLogin = async (username, password) => {
  // Search database by username
  const user = await (await connect())
    .collection("students")
    .findOne({ username });
  if (user === null)
    // Throw error if username was not found
    throw {
      custom: true,
      code: 404,
      message: `Student ${username} was not found in the database.`,
    };
  if (!(await argon2.verify(user.hash, password)))
    throw {
      custom: true,
      code: 403,
      message: `Incorrect student credentials.`,
    };
  await disconnect();
  return {
    token: signJwt({ email: user.email }),
  };
};

/**
 * Fetch student profile data
 * @param {string} email The email of the student
 * @returns Student profile data
 */
const fetchStudentProfile = async (email) => {
  const student = await (await connect())
    .collection("students")
    .findOne({ email }, { projection: { hash: 0, username: 0, _id: 0 } });
  if (student === null)
    throw {
      custom: true,
      code: 404,
      message: `Student with email ${email} was not found in the database.`,
    };
  await disconnect();
  return student;
};

/**
 * Add a new student to the database
 * @param {string} name The full name of the student
 * @param {string} email The email address of the student
 * @param {string} studentClass The class of the student
 * @param {string} section The section of the student
 * @param {string} roll The roll no. of the student
 * @param {string} code The school code of the student
 * @returns The newly added student data
 */
const addNewStudent = async (
  name,
  email,
  studentClass,
  section,
  roll,
  code
) => {
  const schoolData = await (await connect())
    .collection("schools")
    .findOne({ code });
  if (schoolData === null)
    // Throw error if school code was not found
    throw {
      custom: true,
      code: 404,
      message: `School code ${code} was not found in the database.`,
    };
  const exisitngStudent = await (await connect())
    .collection("students")
    .findOne({ email });
  if (exisitngStudent !== null)
    // Throw error if exisitng student was found
    throw {
      custom: true,
      code: 409,
      message: `Student with email ${email} already exists in the database.`,
    };
  // Find number of exisitng students
  const exisitingStudentsArray = await (await connect())
    .collection("students")
    .find({ code })
    .toArray();
  // Create new student object
  const newStudent = {
    name,
    email,
    code,
    class: studentClass,
    section,
    roll,
    username: `iv-${code}-${exisitingStudentsArray.length + 1}`,
    password: nanoid(8),
  };
  // Store the hash in the database and return raw password
  const { password, ...properties } = newStudent;
  const hash = await argon2.hash(password);
  await studentMongodbSchema.validate({ ...properties, hash });
  await (await connect())
    .collection("students")
    .insertOne({ ...properties, hash });
  await disconnect();
  return newStudent;
};

/**
 * Add students in bulk
 * @param {Buffer} file The buffer of the CSV file
 * @param {string} code The school code
 * @returns Buffer of the CSV file
 */
const addNewStudentsInBulk = async (file, code) => {
  const jsonData = await converter.csv2jsonAsync(file.toString());
  let responseArray = [];
  for (let i = 0; i < jsonData.length; i++) {
    let element = jsonData[i];
    try {
      const data = await addNewStudent(
        element.name,
        element.email,
        element.studentClass,
        element.section,
        element.roll,
        code
      );
      const { _id, ...properties } = data;
      responseArray.push(properties);
    } catch (error) {
      logger.error(error);
    }
  }
  return Buffer.from(await converter.json2csvAsync(responseArray), "utf8");
};

module.exports = {
  verifyStudentLogin,
  fetchStudentProfile,
  addNewStudent,
  addNewStudentsInBulk,
};
