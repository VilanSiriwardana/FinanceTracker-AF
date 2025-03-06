const {
  PermissionDeniedError,
} = require("../utils/ErrorHandling/CustomErrors.js");

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new PermissionDeniedError(
          "You do not have permission to perform this action"
        )
      );
    }
    next();
  };
};

module.exports = { restrictTo };
