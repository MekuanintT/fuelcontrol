// routes/setup.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

router.get('/', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'OPERATOR',
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                plate_number VARCHAR(20) UNIQUE NOT NULL,
                owner_name VARCHAR(100) NOT NULL,
                fuel_quota NUMERIC(10,2) DEFAULT 100.00,
                waiting_hours INTEGER DEFAULT 24,
                status VARCHAR(10) DEFAULT 'ACTIVE'
            );
            CREATE TABLE IF NOT EXISTS fuel_transactions (
                id SERIAL PRIMARY KEY,
                plate_number VARCHAR(20) NOT NULL,
                fuel_amount NUMERIC(10,2) NOT NULL,
                fuel_time TIMESTAMP DEFAULT NOW(),
                approved BOOLEAN DEFAULT FALSE,
                rejection_reason TEXT
            );
        `);

        const hash = await bcrypt.hash('admin123', 10);
        await pool.query(
            `INSERT INTO users (username, password, role)
             VALUES ('admin', $1, 'ADMIN')
             ON CONFLICT (username) DO NOTHING`,
            [hash]
        );

        const hash2 = await bcrypt.hash('operator123', 10);
        await pool.query(
            `INSERT INTO users (username, password, role)
             VALUES ('operator', $1, 'OPERATOR')
             ON CONFLICT (username) DO NOTHING`,
            [hash2]
        );

        res.send('Setup complete: tables created, admin/admin123 and operator/operator123 ready.');
    } catch (err) {
        res.status(500).send('Setup failed: ' + err.message);
    }
});

module.exports = router;