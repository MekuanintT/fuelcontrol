const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    })
    : new Pool({
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