const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('CreditCard', {
  cardNumber: { type: DataTypes.STRING, primaryKey: true },
  token: { type: DataTypes.STRING }
}, { timestamps: false });