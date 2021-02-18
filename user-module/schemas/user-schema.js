const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
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
  admin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("UserSchema", UserSchema, "users");
