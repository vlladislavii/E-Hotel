const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Hotel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  numberOfStars: { type: DataTypes.INTEGER },
  address: { type: DataTypes.STRING }
}, { timestamps: false });