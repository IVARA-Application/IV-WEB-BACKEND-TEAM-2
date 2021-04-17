const yup = require("yup");

const newStudentBodySchema = new yup.ObjectSchema({
  name: yup.string().min(1).trim().required(),
  email: yup.string().email().trim().required(),
  studentClass: yup.string().min(1).trim().required(),
  section: yup.string().min(1).trim().required(),
  roll: yup.string().min(1).trim().required(),
  code: yup.string().min(1).trim().required(),
});

const studentMongodbSchema = new yup.ObjectSchema({
  name: yup.string().min(1).trim().required(),
  email: yup.string().email().trim().required(),
  class: yup.string().min(1).trim().required(),
  section: yup.string().min(1).trim().required(),
  roll: yup.string().min(1).trim().required(),
  code: yup.string().min(1).trim().required(),
  hash: yup.string().min(1).trim().required(),
});

const studentLoginSchema = new yup.ObjectSchema({
  username: yup.string().min(1).trim().required(),
  password: yup.string().min(1).trim().required(),
});

module.exports = {
  newStudentBodySchema,
  studentMongodbSchema,
  studentLoginSchema,
};
