const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// GET /api/coupons/validate
router.get('/validate', couponController.validateCoupon);

module.exports = router;