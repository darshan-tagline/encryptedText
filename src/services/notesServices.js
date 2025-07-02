const notes = require("../models/notes.model");

exports.findOneAndUpdateNote = (query, updates, options) => {
  return notes.findOneAndUpdate(query, updates, options);
};
exports.deleteOneNote = (query) => {
  return notes.deleteOne(query);
};
exports.findOneNote = (query, projection, options) => {
  return notes.findOne(query, projection, options);
};
