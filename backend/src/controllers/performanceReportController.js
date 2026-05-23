const { PerformanceReport, Booking, Room, Hotel, Resort } = require('../models');
const { Op } = require('sequelize');
const { generateReportPdf } = require('../utils/pdfGenerator');


function monthRange(yearMonth) {
    const [year, month] = yearMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { start, end };
}

function nightsBetween(checkIn, checkOut) {
    const ms = new Date(checkOut) - new Date(checkIn);
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

async function computeStats(yearMonth) {
    const { start, end } = monthRange(yearMonth);

    const hotels = await Hotel.findAll({ raw: true });

    const bookings = await Booking.findAll({
        where: { checkInDate: { [Op.gte]: start, [Op.lt]: end } },
        include: [{ model: Room, attributes: ['type', 'price', 'hotelId'] }]
    });

    const hotelMap = {};
    hotels.forEach((h) => {
        hotelMap[h.id] = {
            hotelId: h.id,
            name: h.name,
            roomEarnings: 0,
            singleBookings: 0,
            doubleBookings: 0,
            cancellations: 0,
            totalBookings: 0
        };
    });

    for (const booking of bookings) {
        const room = booking.Room;
        if (!room) continue;
        const hotel = hotelMap[room.hotelId];
        if (!hotel) continue;

        if (booking.status === 'canceled') {
            hotel.cancellations += 1; 
            continue;
        }
        if (booking.status === 'invalid') continue;

        const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);
        hotel.roomEarnings += parseFloat(room.price) * nights;
        hotel.totalBookings += 1;

        if (room.type === 'single') hotel.singleBookings += 1;
        else if (room.type === 'double') hotel.doubleBookings += 1;
    }

    const hotelStats = Object.values(hotelMap).map((h) => ({
        ...h,
        roomEarnings: Number(h.roomEarnings.toFixed(2)),
        popularRoomType: h.doubleBookings > h.singleBookings ? 'double' : 'single'
    }));

    const resort = hotelStats.reduce(
        (acc, h) => {
            acc.roomEarnings += h.roomEarnings;
            acc.singleBookings += h.singleBookings;
            acc.doubleBookings += h.doubleBookings;
            acc.cancellations += h.cancellations;
            acc.totalBookings += h.totalBookings;
            return acc;
        },
        { roomEarnings: 0, singleBookings: 0, doubleBookings: 0, cancellations: 0, totalBookings: 0 }
    );
    resort.roomEarnings = Number(resort.roomEarnings.toFixed(2));
    resort.popularRoomType = resort.doubleBookings > resort.singleBookings ? 'double' : 'single';

    return { resort, hotels: hotelStats };
}

exports.getAllReports = async (req, res) => {
    try {
        const reports = await PerformanceReport.findAll({
            order: [['yearMonth', 'DESC'], ['timeStamp', 'DESC']]
        });
        res.status(200).json(reports);
    } catch (error) {
        console.error('getAllReports error:', error);
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};

exports.generateReport = async (req, res) => {
    try {
        const { yearMonth } = req.body;
        if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
            return res.status(400).json({ message: 'A valid "yearMonth" (YYYY-MM) is required' });
        }

        const resort = await Resort.findOne();
        const stats = await computeStats(yearMonth);

        const payload = {
            yearMonth,
            resortId: resort ? resort.id : null,
            totalRoomEarnings: stats.resort.roomEarnings,
            totalCancelations: stats.resort.cancellations,
            popularRoomType: stats.resort.popularRoomType,
            timeStamp: new Date()
        };

        const existing = await PerformanceReport.findOne({
            where: { yearMonth, resortId: payload.resortId }
        });

        let report;
        if (existing) {
            await existing.update(payload);
            report = existing;
        } else {
            report = await PerformanceReport.create(payload);
        }

        report.pdfLink = `/api/reports/${report.id}/download`;
        await report.save();

        res.status(201).json(report);
    } catch (error) {
        console.error('generateReport error:', error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

exports.downloadReport = async (req, res) => {
    try {
        const report = await PerformanceReport.findByPk(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const resort = report.resortId
            ? await Resort.findByPk(report.resortId)
            : await Resort.findOne();

        const stats = await computeStats(report.yearMonth);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="performance-report-${report.yearMonth}.pdf"`
        );

        generateReportPdf(res, {
            yearMonth: report.yearMonth,
            generatedAt: report.timeStamp,
            resortName: resort ? resort.name : 'Resort',
            stats
        });
    } catch (error) {
        console.error('downloadReport error:', error);
        res.status(500).json({ message: 'Error downloading report', error: error.message });
    }
};
