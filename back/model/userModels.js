const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    min: 3,
    max: 10,
  },
  email: {
    type: String,
    required: true,

    max: 25,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: "",
  },
  otp: {
    type: Number,
  },
  token: {
    type: String,
    default: null,
  },
},{timestamps: true});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
