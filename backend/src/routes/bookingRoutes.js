const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authenticateToken');

// GET /api/bookings
router.get('/', authenticateToken, bookingController.getAllBookings);

//PATCH /api/bookings/:number/check-in
router.patch('/:number/check-in', authenticateToken, bookingController.checkIn);

//PATCH /api/bookings/:number/check-out
router.patch('/:number/check-out', authenticateToken, bookingController.checkOut);

//PATCH /api/bookings/:number/extend
router.patch('/:number/extend', authenticateToken, bookingController.extendStay);

//PATCH /api/bookings/:number/invalid
router.patch('/:number/invalid', authenticateToken, bookingController.markAsInvalid);

//PATCH /api/bookings/:number/cancel
router.patch('/:number/cancel', authenticateToken, bookingController.cancelBooking);

//POST /api/bookings/
router.post('/', authenticateToken, bookingController.createBooking);

module.exports = router;