const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    encText: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Note", noteSchema);
