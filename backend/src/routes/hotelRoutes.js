const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// GET /api/hotels
router.get('/', hotelController.getAllHotels);

// GET /api/hotels/:id/services
router.get('/:id/services', hotelController.getHotelServices);

module.exports = router;