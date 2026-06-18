const { Pool } = require('pg');
require('dotenv').config();

const secret = process.env.JWT_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET env variable is not set');
}

const pool = new Pool({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    user:     process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'fuel_system',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

(async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database successfully.');
        client.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
})();

module.exports = pool;