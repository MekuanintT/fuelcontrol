const router         = require('express').Router();
const AuthController = require('../controllers/authController');

// POST /api/auth — Login
router.post('/', AuthController.login);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

module.exports = router;