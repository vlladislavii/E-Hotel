// Express instance for handling requests etc
const express = require('express');
// Cors for allowing cross-origin requests (React frontend will be on a different port)
const cors = require('cors');
// Load environment variables from .env file
require('dotenv').config();

// Database connection (Object-Relational Mapping with Sequelize)
const sequelize = require('./config/db');
// Swagger setup for API documentation, using YAML for easier readability, and path for resolving file paths
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
// Load the Swagger document (YAML file)
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger/e-hotel.yaml'));

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test route
app.get('/', (req, res) => res.send('E-Hotel backend is running!'));

// App routes
const hotelRoutes = require('./routes/hotelRoutes');
app.use('/api/hotels', hotelRoutes);

// Start server after DB connection
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL connected on port ${process.env.DB_PORT || 3305}`);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Backend server is running on port ${PORT}`));
  } catch (err) {
    console.error('Unable to connect to DB:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;