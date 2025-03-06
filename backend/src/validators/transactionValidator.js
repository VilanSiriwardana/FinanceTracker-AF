const { body } = require("express-validator");

exports.transactionValidator = [
  body("amount")
    .not()
    .isEmpty()
    .withMessage("Amount cannot be empty")
    .isNumeric()
    .withMessage("Amount should be a number"),

  body("type")
    .not()
    .isEmpty()
    .withMessage("Type cannot be empty")
    .isIn(["income", "expense"])
    .withMessage("Type should be either 'income' or 'expense'"),

  body("category")
    .not()
    .isEmpty()
    .withMessage("Category cannot be empty")
    .isString()
    .withMessage("Category should be a string"),
];
