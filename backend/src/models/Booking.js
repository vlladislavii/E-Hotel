const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Booking', {
  number: { type: DataTypes.STRING, primaryKey: true },
  checkInDate: { type: DataTypes.DATE, allowNull: false },
  checkOutDate: { type: DataTypes.DATE, allowNull: false },
  totalCost: { type: DataTypes.DECIMAL(10, 2) },
  status: { type: DataTypes.ENUM('confirmed', 'checked-in', 'completed', 'canceled', 'invalid'), allowNull: false },
  gracePeriodEndTimeStamp: { type: DataTypes.DATE }
}, { timestamps: false });