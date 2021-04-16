"use strict";

const { nanoid } = require("nanoid");
const converter = require("json-2-csv");
const { connect, disconnect } = require("../utilities/database");
const logger = require("../utilities/logger");

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
  await disconnect();
};

/**
 * Add a new student
 * @param {string} name The name of the student
 * @param {string} email The email of the student
 * @param {string} code The school code of the student
 * @returns The newly added student data
 */
const addNewStudent = async (name, email, code) => {
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
    username: `iv-${code}-${exisitingStudentsArray.length + 1}`,
    password: nanoid(8),
  };
  await (await connect()).collection("students").insertOne(newStudent);
  await disconnect();
  return newStudent;
};

const addNewStudentsInBulk = async (file, code) => {
  const jsonData = await converter.csv2jsonAsync(file.toString());
  let responseArray = [];
  for (let i = 0; i < jsonData.length; i++) {
    let element = jsonData[i];
    try {
      responseArray.push(
        await addNewStudent(element.name, element.email, code)
      );
    } catch (error) {
      logger.error(error);
    }
  }
  return Buffer.from(await converter.json2csvAsync(responseArray), "utf8");
};

module.exports = { verifyStudentLogin, addNewStudent, addNewStudentsInBulk };
