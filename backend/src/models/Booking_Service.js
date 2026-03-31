const sequelize = require('../config/db');
module.exports = sequelize.define('Booking_Service', {}, { 
  timestamps: false, 
  tableName: 'Booking_Service'
});