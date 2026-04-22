const { Hotel, Room, Booking, BookingStatusLog, CreditCard, Tourist } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const hotelCount = await Hotel.count();

        const activeBookingsCount = await Booking.count({
            where: { status: { [Op.in]: ['confirmed', 'checked-in'] } }
        });

        const occupiedBookings = await Booking.findAll({
            where: {
                status: { [Op.in]: ['confirmed', 'checked-in'] },
                checkInDate: { [Op.lte]: today },
                checkOutDate: { [Op.gte]: today }
            },
            attributes: ['roomId'],
            raw: true
        });

        const occupiedRoomIds = occupiedBookings.map(b => b.roomId);
        

        const totalRoomsCount = await Room.count();
        
        const availableRoomsCount = await Room.count({
            where: {
                id: { [Op.notIn]: occupiedRoomIds.length > 0 ? occupiedRoomIds : [-1] }
            }
        });

        const occupancyRate = totalRoomsCount > 0 
            ? Math.round(((totalRoomsCount - availableRoomsCount) / totalRoomsCount) * 100) 
            : 0;

        const recentLogs = await BookingStatusLog.findAll({
            limit: 4,
            order: [['timeStamp', 'DESC']],
            include: [{
                model: Booking,
                attributes: ['number'],
                include: [{
                    model: CreditCard,
                    include: [{ model: Tourist, attributes: ['name'] }]
                }]
            }]
        });

        const upcomingCheckouts = await Booking.findAll({
            where: {
                status: 'checked-in',
                checkOutDate: {
                    [Op.between]: [startOfToday, endOfToday]
                }
            },
            limit: 4,
            include: [
                { model: Room, attributes: ['number'] },
                { 
                    model: CreditCard, 
                    include: [{ model: Tourist, attributes: ['name'] }] 
                }
            ]
        });

        res.json({
            stats: [
                { 
                    title: "Total Hotels", 
                    value: hotelCount.toString(), 
                    change: "All resorts", 
                    icon: "hotel", 
                    color: "#3b82f6" 
                },
                { 
                    title: "Available Rooms", 
                    value: availableRoomsCount.toString(), 
                    change: `${occupancyRate}% occupancy`, 
                    icon: "bed", 
                    color: "#22c55e" 
                },
                { 
                    title: "Active Bookings", 
                    value: activeBookingsCount.toString(), 
                    change: "In progress", 
                    icon: "users", 
                    color: "#a855f7" 
                }
            ],
            activity: recentLogs.map(log => ({
                guest: log.Booking?.CreditCard?.Tourist?.name || "Unknown",
                type: log.toStatus,
                hotel: `Booking #${log.bookingNumber}`,
                time: new Date(log.timeStamp).toLocaleTimeString()
            })),
            checkouts: upcomingCheckouts.map(c => ({
                guest: c.CreditCard?.Tourist?.name,
                room: c.Room?.number,
                hotel: "Resort",
                time: "Today"
            }))
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ error: error.message });
    }
};