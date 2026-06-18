const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_fuelcontrol_key_2026', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden: ADMIN access required' });
    }
    next();
}

module.exports = { authenticateToken, requireAdmin };