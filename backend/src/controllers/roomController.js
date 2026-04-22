const { Room, Hotel, Booking, Service } = require('../models');
const { Op } = require('sequelize');

exports.searchAvailableRooms = async (req, res) => {
    try {
        const { hotelId, from, to, type } = req.query;

        if (from && to && new Date(from) >= new Date(to)) {
            return res.status(400).json({ 
                message: "Invalid dates: Check-out must be after check-in." 
            });
        }

        let roomFilters = {};
        if (hotelId && hotelId !== 'all') roomFilters.hotelId = hotelId;
        if (type) roomFilters.type = type;

        let occupiedRoomIds = [];
        
        if (from && to) {
            const occupiedBookings = await Booking.findAll({
                attributes: ['roomId'],
                where: {
                    status: { [Op.notIn]: ['canceled', 'invalid'] },
                    checkInDate: { [Op.lt]: to },
                    checkOutDate: { [Op.gt]: from }
                }
            });
            
            occupiedRoomIds = [...new Set(occupiedBookings.map(b => b.roomId))];
        }

        const rooms = await Room.findAll({
            where: {
                ...roomFilters,
                ...(occupiedRoomIds.length > 0 && { id: { [Op.notIn]: occupiedRoomIds } })
            },
            include: [
                {
                    model: Hotel,
                    attributes: ['name', 'numberOfStars', 'address']
                }
            ]
        });

        res.status(200).json(rooms);

    } catch (error) {
        console.error("Search Room Error:", error);
        res.status(500).json({ message: "Error searching rooms", error: error.message });
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findByPk(req.params.id, {
            include: [
                {
                    model: Hotel,
                    include: [{ 
                        model: Service,
                        as: 'hotelServices' 
                    }]
                }
            ]
        });
        if (!room) return res.status(404).json({ message: "Room not found" });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};