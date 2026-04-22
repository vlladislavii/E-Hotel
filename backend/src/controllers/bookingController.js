const { Booking, Hotel, Room, Tourist, CreditCard, Coupon, Service, BookingStatusLog, Booking_Service, Bill, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getAllBookings = async (req, res) => {
    try {
        const { search } = req.query;

        let whereCondition = {};
        if (search) {
            whereCondition = {
                [Op.or]: [
                    { number: { [Op.like]: `%${search}%` } },
                    { '$CreditCard.Tourist.name$': { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const bookings = await Booking.findAll({
            where: whereCondition,
            include: [
                { model: Bill },
                {
                    model: Room,
                    include: [{ model: Hotel, attributes: ['name'] }]
                },
                {
                    model: CreditCard,
                    include: [{ model: Tourist, attributes: ['name'] }]
                }
            ],
            order: [['checkInDate', 'ASC']]
        });

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const { number } = req.params;
        const booking = await Booking.findByPk(number);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== 'confirmed') {
            return res.status(400).json({ 
                message: `Cannot check-in. Current status is '${booking.status}', but expected 'confirmed'.` 
            });
        }
        
        booking.status = 'checked-in';
        await booking.save();

        await BookingStatusLog.create({
            toStatus: 'checked-in',
            bookingNumber: booking.number,
            changedByCashierCNP: req.user ? req.user.CNP : null
        });

        res.status(200).json({ message: "Checked in successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Error during check-in", error: error.message });
    }
};

exports.checkOut = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { number } = req.params;
        const { paymentMethod } = req.body; 

        const booking = await Booking.findByPk(number, { transaction: t });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status !== 'checked-in') {
            await t.rollback();
            return res.status(400).json({ 
                message: `Cannot check-out. Current status is '${booking.status}', but expected 'checked-in'.` 
            });
        }

        let couponNumber = 'DISCOUNT3';
        const total = parseFloat(booking.totalCost);
        
        if (total > 1000) couponNumber = 'LOYALTY10';
        else if (total > 500) couponNumber = 'PROMO5';

        const coupon = await Coupon.findOne({ 
            where: { number: couponNumber }, 
            transaction: t 
        });

        const newBill = await Bill.create({
            totalPayAmount: booking.totalCost,
            bookingNumber: booking.number
        }, { transaction: t });

        booking.status = 'completed';
        await booking.save({ transaction: t });

        await BookingStatusLog.create({
            toStatus: 'completed',
            bookingNumber: booking.number,
            changedByCashierCNP: req.user ? req.user.CNP : null
        }, { transaction: t });

        await t.commit();

        res.status(200).json({ 
            message: "Check-out completed and Bill issued", 
            billNumber: newBill.number,
            totalPaid: newBill.totalPayAmount,
            booking 
        });
    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ message: "Error during check-out process", error: error.message });
    }
};

exports.extendStay = async (req, res) => {
    try {
        const { number } = req.params;
        const { newCheckOutDate } = req.body;

        const booking = await Booking.findByPk(number, {
            include: [{ model: Room }]
        });

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const oldOut = new Date(booking.checkOutDate);
        const newOut = new Date(newCheckOutDate);
        
        const diffTime = newOut - oldOut;
        const extraNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (extraNights <= 0) {
            return res.status(400).json({ message: "New date must be after current check-out date" });
        }

        const conflict = await Booking.findOne({
            where: {
                roomId: booking.roomId,
                number: { [Op.ne]: number },
                status: { [Op.notIn]: ['canceled', 'invalid'] },
                checkInDate: { [Op.lt]: newCheckOutDate },
                checkOutDate: { [Op.gt]: booking.checkOutDate }
            }
        });

        if (conflict) {
            return res.status(409).json({ message: "Room is occupied for these dates" });
        }

        const extraCharge = extraNights * parseFloat(booking.Room.price);
        booking.totalCost = parseFloat(booking.totalCost) + extraCharge;
        booking.checkOutDate = newCheckOutDate;
        
        await booking.save();

        res.status(200).json({ 
            message: "Stay extended", 
            extraCharge, 
            newTotal: booking.totalCost 
        });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { number } = req.params;
        const booking = await Booking.findByPk(number);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== 'confirmed') {
            return res.status(400).json({ message: "Only 'confirmed' bookings can be canceled." });
        }

        const now = new Date();
        if (booking.gracePeriodEndTimeStamp && now > new Date(booking.gracePeriodEndTimeStamp)) {
            return res.status(403).json({ message: "Grace period expired. Cancellation blocked." });
        }

        booking.status = 'canceled';
        await booking.save();

        await BookingStatusLog.create({
            toStatus: 'canceled',
            bookingNumber: booking.number,
            changedByCashierCNP: req.user ? req.user.CNP : null
        });


        res.status(200).json({ message: "Booking canceled successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Error canceling booking", error: error.message });
    }
};

exports.markAsInvalid = async (req, res) => {
    try {
        const { number } = req.params;
        const booking = await Booking.findByPk(number);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const terminalStatuses = ['completed', 'canceled', 'invalid'];
        if (terminalStatuses.includes(booking.status)) {
            return res.status(400).json({ message: `Booking is already in a terminal state: ${booking.status}` });
        }

        booking.status = 'invalid';
        await booking.save();

        await BookingStatusLog.create({
            toStatus: 'invalid',
            bookingNumber: booking.number,
            changedByCashierCNP: req.user ? req.user.CNP : null
        });


        res.status(200).json({ message: "Booking marked as invalid", booking });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};

const crypto = require('crypto');

const generateCardToken = (number, expiry, cvv) => {
    const data = `${number}-${expiry}-${cvv}`;
    return 'tok_' + crypto.createHash('md5').update(data).digest('hex').substring(0, 12);
};

exports.createBooking = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { roomId, checkInDate, checkOutDate, tourist, payment, couponCode, services } = req.body;

        const room = await Room.findByPk(roomId, { 
            include: [{ model: Hotel }],
            transaction: t 
        });
        if (!room) {
            await t.rollback();
            return res.status(404).json({ message: "Room not found" });
        }

        let validServices = [];
        let servicesTotalPerDay = 0;

        if (services && services.length > 0) {
            validServices = await Service.findAll({
                where: { 
                    id: services,
                    hotelId: room.hotelId
                },
                transaction: t
            });

            if (validServices.length !== services.length) {
                await t.rollback();
                return res.status(400).json({ message: "One or more services do not belong to this hotel." });
            }

            servicesTotalPerDay = validServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
        }

        let existingTourist = await Tourist.findByPk(tourist.CNP);
        if (existingTourist) {
            if (existingTourist.name !== tourist.name) {
                await t.rollback();
                return res.status(400).json({ message: "CNP already exists with a different name." });
            }
        } else {
            existingTourist = await Tourist.create({ CNP: tourist.CNP, name: tourist.name }, { transaction: t });
        }

        const newToken = generateCardToken(payment.cardNumber, payment.expiryDate, payment.cvv);
        let card = await CreditCard.findByPk(payment.cardNumber);
        if (card) {
            if (card.token !== newToken) {
                await t.rollback();
                return res.status(400).json({ message: "Card details mismatch." });
            }
        } else {
            card = await CreditCard.create({
                cardNumber: payment.cardNumber,
                token: newToken,
                touristId: existingTourist.CNP
            }, { transaction: t });
        }

        let appliedCouponId = null;
        let discount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ where: { number: couponCode }, transaction: t });
            if (!coupon) {
                await t.rollback();
                return res.status(400).json({ message: "Invalid coupon." });
            }
            appliedCouponId = coupon.id;
            discount = coupon.percentage;
        }

        const overlappingBooking = await Booking.findOne({
            where: {
                roomId,
                status: { [Op.notIn]: ['canceled', 'invalid'] },
                [Op.and]: [
                    { checkInDate: { [Op.lt]: checkOutDate } },
                    { checkOutDate: { [Op.gt]: checkInDate } }
                ]
            },
            transaction: t
        });
        if (overlappingBooking) {
            await t.rollback();
            return res.status(409).json({ message: "Room is already booked." });
        }

        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        const nights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;

        let totalCost = (parseFloat(room.price) + servicesTotalPerDay) * nights;
        if (discount > 0) totalCost -= (totalCost * discount) / 100;

        const creationDate = new Date();
        const checkInDateObj = new Date(checkInDate);
        const limit7Days = new Date(checkInDateObj.getTime() - (7 * 24 * 60 * 60 * 1000));
        limit7Days.setHours(23, 59, 59, 999);
        let gracePeriodDate = creationDate < limit7Days ? limit7Days : (new Date(creationDate.getTime() + 86400000) < checkInDateObj ? new Date(creationDate.getTime() + 86400000) : checkInDateObj);

        const bookingNumber = `BK-${room.hotelId}-${Date.now().toString().slice(-6)}`;
        const newBooking = await Booking.create({
            number: bookingNumber,
            checkInDate,
            checkOutDate,
            status: 'confirmed',
            totalCost: totalCost.toFixed(2),
            gracePeriodEndTimeStamp: gracePeriodDate,
            creationTimeStamp: creationDate,
            roomId,
            cardId: card.cardNumber,
            appliedCouponId
        }, { transaction: t });

        if (validServices.length > 0) {
            const bookingServiceEntries = validServices.map(s => ({
                bookingNumber: newBooking.number,
                serviceId: s.id
            }));
            await Booking_Service.bulkCreate(bookingServiceEntries, { transaction: t });
        }

        await BookingStatusLog.create({
            toStatus: 'confirmed',
            bookingNumber: newBooking.number,
            changedByCashierCNP: req.user ? req.user.CNP : null
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ 
            message: "Booking created successfully", 
            bookingNumber: newBooking.number,
            totalCost: newBooking.totalCost
        });

    } catch (error) {
        if (t) await t.rollback();
        console.error(error);
        res.status(500).json({ message: "Booking failed", error: error.message });
    }
};