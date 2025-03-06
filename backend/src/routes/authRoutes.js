const express = require("express");
const router = express.Router();
const { signupUser, loginUser } = require("../controllers/authController");
const {
  signupValidator,
  loginValidator,
} = require("../validators/authValidator");
const { validate } = require("../utils/utils");

router.post("/signup", signupValidator, validate, signupUser);
router.post("/login", loginValidator, validate, loginUser);

module.exports = router;
