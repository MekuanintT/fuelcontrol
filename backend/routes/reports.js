const router           = require('express').Router();
const ReportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reports?type=daily|weekly|vehicle&plate_number=...
router.get('/', authenticateToken, ReportController.getReport);

module.exports = router;