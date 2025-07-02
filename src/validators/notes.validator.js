const joi = require("joi");

exports.saveNoteValidator = joi.object({
  id: joi.string().required().messages({
    "string.base": "Note id must be a string",
    "any.required": "Note id is required",
    "string.empty": "Note id cannot be empty",
  }),
  encText: joi.object({
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
  })
});

exports.getNoteValidator = joi.object({
  id: joi.string().required().messages({
    "string.base": "Note id must be a string",
    "any.required": "Note id is required",
    "string.empty": "Note id cannot be empty",
  }),
});