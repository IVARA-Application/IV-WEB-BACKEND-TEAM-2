const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomUserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  firstname: {
    type: String,
    default: "",
  },
  lastname: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  phoneno: {
    type: Number,
    default: "",
  },
  email: {
    type: String,
    default: "",
    unique: false,
    required: false,
  },
});

module.exports = mongoose.model("CustomUserSchema", CustomUserSchema, "users");
