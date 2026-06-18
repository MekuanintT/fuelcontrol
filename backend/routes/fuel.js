const router         = require('express').Router();
const FuelController = require('../controllers/fuelController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/fuel
router.get('/',     authenticateToken,               FuelController.getAll);

// POST /api/fuel — Request Fuel
router.post('/',    authenticateToken,               FuelController.requestFuel);

// DELETE /api/fuel/:id
router.delete('/:id', authenticateToken, requireAdmin, FuelController.delete);

module.exports = router;