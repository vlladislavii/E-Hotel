const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// GET /api/rooms/search
router.get('/search', roomController.searchAvailableRooms);

// GET /api/rooms/:id
router.get('/:id', roomController.getRoomById);

module.exports = router;