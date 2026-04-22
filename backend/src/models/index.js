const sequelize = require('../config/db');

const Resort = require('./Resort');
const Hotel = require('./Hotel');
const Room = require('./Room');
const Service = require('./Service');
const Tourist = require('./Tourist');
const CreditCard = require('./CreditCard');
const Cashier = require('./Cashier');
const Booking = require('./Booking');
const Booking_Service = require('./Booking_Service');
const BookingStatusLog = require('./BookingStatusLog');
const Bill = require('./Bill');
const Coupon = require('./Coupon');
const PerformanceReport = require('./PerformanceReport');

// One-to-Many (Resort->Hotel)
Resort.hasMany(Hotel, { foreignKey: 'resortId' });
Hotel.belongsTo(Resort, { foreignKey: 'resortId' });

// One-to-Many (Hotel->Room)
Hotel.hasMany(Room, { foreignKey: 'hotelId' });
Room.belongsTo(Hotel, { foreignKey: 'hotelId' });

// One-to-Many (Hotel->Service)
Hotel.hasMany(Service, { foreignKey: 'hotelId', as: 'hotelServices'});
Service.belongsTo(Hotel, { foreignKey: 'hotelId' });

// One-to-Many (Tourist->CreditCard)
Tourist.hasMany(CreditCard, { foreignKey: 'touristId' });
CreditCard.belongsTo(Tourist, { foreignKey: 'touristId' });

// One-to-Many (Room->Booking)
Room.hasMany(Booking, { foreignKey: 'roomId' });
Booking.belongsTo(Room, { foreignKey: 'roomId' });

// One-to-Many (CreditCard->Booking)
CreditCard.hasMany(Booking, { foreignKey: 'cardId' });
Booking.belongsTo(CreditCard, { foreignKey: 'cardId' });

// One-to-Many (Coupon->Booking)
Coupon.hasMany(Booking, { foreignKey: 'appliedCouponId' });
Booking.belongsTo(Coupon, { foreignKey: 'appliedCouponId' });

// Many-Many (Booking-Service)
// Using table Booking_Service
Booking.belongsToMany(Service, { 
    through: Booking_Service, 
    foreignKey: 'bookingNumber', 
    otherKey: 'serviceId' 
});
Service.belongsToMany(Booking, { 
    through: Booking_Service, 
    foreignKey: 'serviceId', 
    otherKey: 'bookingNumber' 
});

// One-to-Many (Booking->BookingStatusLog)
Booking.hasMany(BookingStatusLog, { foreignKey: 'bookingNumber' });
BookingStatusLog.belongsTo(Booking, { foreignKey: 'bookingNumber' });

// One-to-Many (Booking->Cashier)
Cashier.hasMany(BookingStatusLog, { foreignKey: 'changedByCashierCNP' });
BookingStatusLog.belongsTo(Cashier, { foreignKey: 'changedByCashierCNP' });
BookingStatusLog.belongsTo(Cashier, { 
    foreignKey: 'changedByCashierCNP',
    onDelete: 'SET NULL'
});

// One-to-One (Booking<->Cashier)
Booking.hasOne(Bill, { foreignKey: 'bookingNumber' });
Bill.belongsTo(Booking, { foreignKey: 'bookingNumber' });

// One-to-Many (Coupon->Bill)
Coupon.hasMany(Bill, { foreignKey: 'issuedCouponId' });
Bill.belongsTo(Coupon, { foreignKey: 'issuedCouponId' });

// One-to-Many (Resort->PerformanceReport)
Resort.hasMany(PerformanceReport, { foreignKey: 'resortId' });
PerformanceReport.belongsTo(Resort, { foreignKey: 'resortId' });

module.exports = {
  sequelize,
  Resort, Hotel, Room, Service, Tourist, CreditCard, 
  Cashier, Booking, Booking_Service, BookingStatusLog, Bill, Coupon, PerformanceReport
};