const { response } = require("../utils/common");

exports.validate = (schema) => async (req, res, next) => {
  try {
    const dataToValidate = { ...req.body, ...req.query, ...req.params };

    const { error } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      console.log(
        `Validation error: ${error.details
          .map((detail) => detail.message)
          .join(", ")}`
      );
      return response(
        res,
        400,
        error.details.map((detail) => detail.message).join(", ")
      );
    }

    next();
  } catch (err) {
    console.error("Error while validating:>>>>>", err);
    return response(res, 500, "Server error");
  }
};
