const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  number: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('single', 'double'), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { timestamps: false });