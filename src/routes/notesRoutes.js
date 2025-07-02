const express = require("express");
const {
  getNote,
  saveNote,
  deleteNote,
} = require("../controllers/notesController");
const { validate } = require("../middleware/validateMiddleware");
const {
  getNoteValidator,
  saveNoteValidator,
} = require("../validators/notes.validator");
const router = express.Router();

router.get("/:id", validate(getNoteValidator), getNote);
router.post(
  "/:id",
  // validate(saveNoteValidator)
  saveNote
);
router.delete("/:id", deleteNote);

module.exports = router;
