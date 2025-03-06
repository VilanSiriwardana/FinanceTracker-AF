const { body } = require("express-validator");

exports.categoryValidator = [
  body("name")
    .not()
    .isEmpty()
    .withMessage("Category name cannot be empty")
    .isString()
    .withMessage("Category name should be a string")
    .isLength({ min: 3 })
    .withMessage("Category name should be at least 3 characters long"),

  body("type")
    .not()
    .isEmpty()
    .withMessage("Category type cannot be empty")
    .isIn(["expense", "income"])
    .withMessage("Category type must be either 'expense' or 'income'"),
];
