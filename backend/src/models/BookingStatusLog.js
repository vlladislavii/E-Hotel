const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('BookingStatusLog', {
  toStatus: { type: DataTypes.STRING, allowNull: false },
  timeStamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: false });