const pool = require('../config/db');

const VehicleModel = {
    findAll: async () => {
        const { rows } = await pool.query('SELECT * FROM vehicles ORDER BY id DESC');
        return rows;
    },

    findById: async (id) => {
        const { rows } = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
        return rows[0] || null;
    },

    findByPlate: async (plate, client = pool) => {
        const { rows } = await client.query(
            'SELECT * FROM vehicles WHERE plate_number = $1 FOR UPDATE',
            [plate]
        );
        return rows[0] || null;
    },

    create: async ({ plate, owner, quota, waiting, status }) => {
        const { rows } = await pool.query(
            `INSERT INTO vehicles (plate_number, owner_name, fuel_quota, waiting_hours, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [plate, owner, quota, waiting, status]
        );
        return rows[0];
    },

    update: async (id, { plate, owner, quota, waiting, status }) => {
        const result = await pool.query(
            `UPDATE vehicles
             SET plate_number = $1, owner_name = $2, fuel_quota = $3, waiting_hours = $4, status = $5
             WHERE id = $6`,
            [plate, owner, quota, waiting, status, id]
        );
        return result.rowCount;
    },

    updateStatus: async (id, status) => {
        const result = await pool.query(
            'UPDATE vehicles SET status = $1 WHERE id = $2',
            [status, id]
        );
        return result.rowCount;
    },

    delete: async (id) => {
        const result = await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
        return result.rowCount;
    },
};

module.exports = VehicleModel;