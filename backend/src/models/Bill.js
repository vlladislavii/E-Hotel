const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Bill', {
  number: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  totalPayAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { timestamps: false });