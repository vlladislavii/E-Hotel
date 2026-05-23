const express = require('express');
const router = express.Router();
const reportController = require('../controllers/performanceReportController');

// GET /api/reports
router.get('/', reportController.getAllReports);

// POST /api/reports/generate
router.post('/generate', reportController.generateReport);

// GET /api/reports/:id/download
router.get('/:id/download', reportController.downloadReport);

module.exports = router;
