const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { message: "Too many requests, please try again after some time." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
