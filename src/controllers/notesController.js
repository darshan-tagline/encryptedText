const { response } = require("../utils/common");
const {
  findOneNote,
  findOneAndUpdateNote,
  deleteOneNote,
} = require("../services/notesServices");

exports.getNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await findOneNote({ id }).lean();

    if (!note) {
      return response(res, 404, "Note not found");
    }

    return response(res, 200, "Note found successfully", {
      id,
      encText: note.encText,
    });
  } catch (err) {
    console.error("Internal Server Error", err);
    return response(res, 500, "Internal Server Error");
  }
};

exports.saveNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { encText } = req.body;

    if (!encText) {
      return response(res, 400, "Encrypted text is required");
    }
    const updateFields = {
      id,
      encText,
    };

    const note = await findOneAndUpdateNote({ id }, updateFields, {
      upsert: true,
      new: true,
    });

    return response(res, 200, "Note saved successfully", note);
  } catch (err) {
    console.log("Internal Server Error", err);
    return response(res, 500, "Internal Server Error");
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await findOneNote({ id });
    if (!note) {
      return response(res, 404, "Note not found");
    }
    await deleteOneNote({ id });
    return response(res, 200, "Note deleted successfully");
  } catch (err) {
    console.log("Internal Server Error", err);
    return response(res, 500, "Internal Server Error");
  }
};
