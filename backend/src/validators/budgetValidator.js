const { body } = require("express-validator");

exports.budgetValidator = [
  body("month")
    .not()
    .isEmpty()
    .withMessage("Month cannot be empty")
    .isString()
    .withMessage("Month should be a string"),
  body("year")
    .not()
    .isEmpty()
    .withMessage("Year cannot be empty")
    .isInt()
    .withMessage("Year should be a number"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category should be a string"),
  body("budgetAmount")
    .not()
    .isEmpty()
    .withMessage("Budget amount cannot be empty")
    .isFloat()
    .withMessage("Budget amount should be a number"),
];
