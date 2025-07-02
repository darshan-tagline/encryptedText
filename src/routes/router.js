const express = require("express");
const limiter = require("../middleware/rateLimiter");
const router = express.Router();

router.use("/notes", limiter, require("../routes/notesRoutes"));

module.exports = router;
