const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../utils/ErrorHandling/CustomErrors.js");

exports.authToken = async (req, res, next) => {
  console.log(req);
  const auth = req.header("Authorization");
  if (!auth) {
    return next(new UnauthorizedError("Unauthorized, Please login"));
  }

  const token = auth.split(" ")[1];
  console.log("auth token : ", token);

  if (!token) {
    return next(new UnauthorizedError("Invalid token, Please login"));
  }

  let user = {};

  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user from token:", user);
  } catch {
    return next(new UnauthorizedError("Invalid token, Please login"));
  }
  req.user = user;
  res.locals.user = user;
  next();
};
