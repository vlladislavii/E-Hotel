const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter');

// POST /api/auth/login
router.post('/login', loginLimiter, authController.login);

// POST /api/auth/register
router.post('/register', authController.register);

// DELETE /api/auth/cashiers/:cnp
router.delete('/cashiers/:cnp', authController.deleteCashier);

module.exports = router;