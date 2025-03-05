const { validationResult } = require('express-validator');
const { ValidationFailureError } = require('./ErrorHandling/CustomErrors');

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
  
    if (errors.isEmpty()) {
      return next();
    }
  
    const error = errors.array()[0]; 

    return next(new ValidationFailureError(`${error.msg}`));
    }  