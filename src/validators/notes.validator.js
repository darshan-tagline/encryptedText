const joi = require("joi");

exports.saveNoteValidator = joi.object({
  id: joi.string().required().messages({
    "string.base": "Note id must be a string",
    "any.required": "Note id is required",
    "string.empty": "Note id cannot be empty",
  }),
  encText: joi.string().trim().required().messages({
    "string.base": "Note text must be a string",
    "any.required": "Note text is required",
    "string.empty": "Note text cannot be empty",
  }),
});

exports.getNoteValidator = joi.object({
  id: joi.string().required().messages({
    "string.base": "Note id must be a string",
    "any.required": "Note id is required",
    "string.empty": "Note id cannot be empty",
  }),
});