const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Many login tries! Try to log in again in 15 mins or call administrator."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = loginLimiter;