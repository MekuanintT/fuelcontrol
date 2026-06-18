const pool = require('../config/db');

const UserModel = {
    findByUsername: async (username) => {
        const { rows } = await pool.query(
            'SELECT id, password, role FROM users WHERE username = $1',
            [username.trim()]
        );
        return rows[0] || null;
    },

    updateLastLogin: async (id) => {
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [id]
        );
    },
};

module.exports = UserModel;