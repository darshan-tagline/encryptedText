const joi = require("joi");

exports.saveNoteValidator = joi.object({
  id: joi
    .string()
    .min(3)
    .trim()
    .pattern(/^[a-zA-Z][a-zA-Z0-9]*$/)
    .disallow(/^\d+$/)
    .required()
    .messages({
      "string.base": "Note id must be a string",
      "string.empty": "Note id cannot be empty",
      "string.min": "Note id must be at least 3 characters long",
      "string.pattern.base":
        "Note id must start with a letter and contain only letters and numbers",
      "any.invalid": "Note id cannot be all numbers",
      "any.required": "Note id is required",
    }),
  encText: joi.array().items({
    salt: joi.string().required().messages({
      "string.base": "Salt must be a string",
      "any.required": "Salt is required",
      "string.empty": "Salt cannot be empty",
    }),
    iv: joi.string().required().messages({
      "string.base": "IV must be a string",
      "any.required": "IV is required",
      "string.empty": "IV cannot be empty",
    }),
    data: joi.string().required().messages({
      "string.base": "Data must be a string",
      "any.required": "Data is required",
      "string.empty": "Data cannot be empty",
    }),
  }),
});

exports.getNoteValidator = joi.object({
  id: joi
    .string()
    .min(3)
    .trim()
    .pattern(/^[a-zA-Z][a-zA-Z0-9]*$/)
    .disallow(/^\d+$/)
    .required()
    .messages({
      "string.base": "Note id must be a string",
      "string.empty": "Note id cannot be empty",
      "string.min": "Note id must be at least 3 characters long",
      "string.pattern.base":
        "Note id must start with a letter and contain only letters and numbers",
      "any.invalid": "Note id cannot be all numbers",
      "any.required": "Note id is required",
    }),
});
