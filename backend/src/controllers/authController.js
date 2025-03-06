const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");
const handleResponse = require("../utils/response");
const {
  RecordNotFoundError,
  DuplicateRecordsError,
  BadRequestError,
} = require("../utils/ErrorHandling/CustomErrors.js");
const AppError = require("../utils/ErrorHandling/AppError");

const signupUser = async (req, res, next) => {
  const { username, password, email, phone } = req.body;

  try {
    if (!username || !password || !email || !phone) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const checkUser = await User.findOne({
      $or: [{ email }, { phone }],
    }).lean();

    if (checkUser) {
      return next(
        new DuplicateRecordsError(
          "Email/Phone number is linked to an active account already. Please login"
        )
      );
    }

    const newUser = await User.create({
      username,
      password,
      email,
      phone,
    });

    const details = {
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    };

    const accessToken = jwt.sign(details, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(
      details,
      process.env.REFRESH_TOKEN_JWT_SECRET,
      {
        expiresIn: "20y",
      }
    );

    await RefreshToken.deleteOne({ userId: newUser._id });

    await RefreshToken.create({
      userId: newUser._id,
      refreshToken,
    });

    return handleResponse(res, 201, "Signup successful", {
      user: details,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return next(new RecordNotFoundError("No account found"));
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return next(new BadRequestError("Incorrect password"));
    }

    await User.findOneAndUpdate({ email }, { $set: { loginTime: new Date() } });

    const details = {
      _id: req.user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = jwt.sign(details, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(
      details,
      process.env.REFRESH_TOKEN_JWT_SECRET,
      {
        expiresIn: "20y",
      }
    );

    return handleResponse(res, 200, "Login successful", {
      user: details,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (!adminExists) {
      const newAdmin = new User({
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        phone: process.env.ADMIN_PHONE,
        role: "Admin",
      });

      await newAdmin.save();
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error.message);
  }
};

module.exports = { signupUser, loginUser, createAdminUser };
