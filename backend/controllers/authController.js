const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const AuthController = {
    login: async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        try {
            const user = await UserModel.findByUsername(username);

            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            await UserModel.updateLastLogin(user.id);

            const token = jwt.sign(
                { id: user.id, username: username.trim(), role: user.role },
                process.env.JWT_SECRET || 'super_secret_fuelcontrol_key_2026',
                { expiresIn: '12h' }
            );

            res.json({ success: true, message: 'Login successful', role: user.role, token });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Authentication failed: ' + err.message });
        }
    },

    logout: (req, res) => {
        res.json({ success: true, message: 'Logged out' });
    },
};

module.exports = AuthController;