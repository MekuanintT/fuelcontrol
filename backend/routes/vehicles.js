const router            = require('express').Router();
const VehicleController = require('../controllers/vehicleController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/vehicles
router.get('/',     authenticateToken,               VehicleController.getAll);

// POST /api/vehicles
router.post('/',    authenticateToken, requireAdmin, VehicleController.create);

// PUT /api/vehicles/:id
router.put('/:id',  authenticateToken, requireAdmin, VehicleController.update);

// PATCH /api/vehicles/:id — toggle status
router.patch('/:id', authenticateToken, requireAdmin, VehicleController.patchStatus);

// DELETE /api/vehicles/:id
router.delete('/:id', authenticateToken, requireAdmin, VehicleController.delete);

module.exports = router;