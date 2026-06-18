const pool = require('../config/db');

const FuelModel = {
    findById: async (id) => {
        const { rows } = await pool.query(
            'SELECT * FROM fuel_transactions WHERE id = $1',
            [id]
        );
        return rows[0] || null;
    },

    findAll: async (page = 1) => {
        const limit  = 100;
        const offset = (page - 1) * limit;
        const { rows } = await pool.query(
            'SELECT * FROM fuel_transactions ORDER BY fuel_time DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        return rows;
    },

    findApprovedByPlate: async (plate, client) => {
        const { rows } = await client.query(
            `SELECT fuel_time FROM fuel_transactions
             WHERE plate_number = $1 AND approved = true
             ORDER BY fuel_time DESC`,
            [plate]
        );
        return rows;
    },

    findDuplicateRecent: async (plate, amount, client) => {
        const { rows } = await client.query(
            `SELECT fuel_time FROM fuel_transactions
             WHERE plate_number = $1
               AND fuel_amount  = $2
               AND approved     = true
               AND fuel_time   >= NOW() - INTERVAL '10 seconds'
             LIMIT 1`,
            [plate, amount]
        );
        return rows;
    },

    getTodayTotal: async (plate, client) => {
        const { rows } = await client.query(
            `SELECT COALESCE(SUM(fuel_amount), 0) AS total_today
             FROM fuel_transactions
             WHERE plate_number = $1
               AND approved     = true
               AND DATE(fuel_time) = CURRENT_DATE`,
            [plate]
        );
        return parseFloat(rows[0].total_today);
    },

    insert: async (plate, amount, approved, rejectionReason, client) => {
        const { rows } = await client.query(
            `INSERT INTO fuel_transactions (plate_number, fuel_amount, approved, rejection_reason)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [plate, amount, approved, rejectionReason]
        );
        return rows[0];
    },

    delete: async (id) => {
        const result = await pool.query(
            'DELETE FROM fuel_transactions WHERE id = $1',
            [id]
        );
        return result.rowCount;
    },
};

module.exports = FuelModel;