    const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('PerformanceReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  yearMonth: { type: DataTypes.STRING },
  totalRoomEarnings: { type: DataTypes.DECIMAL(15, 2) },
  totalCancelations: { type: DataTypes.INTEGER },
  popularRoomType: { type: DataTypes.ENUM('single', 'double') },
  timeStamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  pdfLink: { type: DataTypes.STRING }
}, { timestamps: false });