const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const { connectDB } = require("../config/db.config");
const router = require("./routes/router");
const { response } = require("./utils/common");
const PORT = process.env.PORT || 3000;
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
connectDB();

app.use(express.static(path.join(__dirname, "../public")));

app.get("/note.html", (req, res) => {
  const id = req.query.id;
  if (id) {
    return res.redirect(`/${encodeURIComponent(id)}`);
  }
  res.redirect("/");
});

app.get("/:noteId", (req, res, next) => {
  const noteId = req.params.noteId;

  if (noteId === "api") return next();

  const staticFiles = [
    "style.css",
    "script.js",
    "favicon.ico",
    "robots.txt",
    "note.html",
    "index.html",
  ];
  if (staticFiles.includes(noteId)) return next();

  return res.sendFile(path.join(__dirname, "../public/note.html"));
});

app.get(/^\/(?!api$|api\/|$)/, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/note.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/"));
});

app.use("/api", router);

// 404 handler
app.use((_req, res) => {
  return response(res, 404, "Page not found");
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  return response(res, 500, err.message || "Server error");
});

app.listen(PORT, () =>
  console.log(`Server connected successfully and port is ${PORT}`)
);
