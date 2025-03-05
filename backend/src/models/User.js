const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (email) => validator.isEmail(email),
        message: "Invalid email format",
      },
      set: (email) => email.toLowerCase().trim(),
      trim: true,
    },
    password: {
      type: String,
      required: true,
      set: (password) => bcrypt.hashSync(password, 10),
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (userPassword, next) {
  try {
    let isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
  } catch (error) {
    return next(error);
  }
};

module.exports = mongoose.model("User", userSchema);
