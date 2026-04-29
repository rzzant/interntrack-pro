const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

exports.validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Pass the first error message to the global error handler
    const extractedErrors = errors.array().map((err) => err.msg);
    return next(new AppError(extractedErrors[0], 400));
  };
};
