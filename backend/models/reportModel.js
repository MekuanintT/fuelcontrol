const pool = require('../config/db');

const ReportModel = {
    getDailyReport: async () => {
        const { rows } = await pool.query(`
            SELECT DATE(fuel_time)                                          AS fuel_date,
                   COALESCE(SUM(fuel_amount), 0)                           AS total_fuel_liters,
                   COUNT(*)                                                 AS total_transactions,
                   SUM(CASE WHEN approved = true  THEN 1 ELSE 0 END)       AS approved_transactions,
                   SUM(CASE WHEN approved = false THEN 1 ELSE 0 END)       AS rejected_transactions
            FROM fuel_transactions
            GROUP BY DATE(fuel_time)
            ORDER BY DATE(fuel_time) DESC
            LIMIT 30
        `);
        return rows.map(r => ({
            date:         r.fuel_date,
            total_fuel:   parseFloat(r.total_fuel_liters),
            transactions: parseInt(r.total_transactions, 10),
            approved:     parseInt(r.approved_transactions, 10),
            rejected:     parseInt(r.rejected_transactions, 10),
        }));
    },

    getWeeklyReport: async () => {
        const { rows } = await pool.query(`
            SELECT EXTRACT(YEAR FROM fuel_time)                            AS fuel_year,
                   EXTRACT(WEEK FROM fuel_time)                            AS fuel_week,
                   COALESCE(SUM(fuel_amount), 0)                           AS total_fuel_liters,
                   COUNT(*)                                                 AS total_transactions,
                   SUM(CASE WHEN approved = true  THEN 1 ELSE 0 END)       AS approved_transactions,
                   SUM(CASE WHEN approved = false THEN 1 ELSE 0 END)       AS rejected_transactions
            FROM fuel_transactions
            GROUP BY EXTRACT(YEAR FROM fuel_time), EXTRACT(WEEK FROM fuel_time)
            ORDER BY fuel_year DESC, fuel_week DESC
            LIMIT 12
        `);
        return rows.map(r => ({
            year:         parseInt(r.fuel_year, 10),
            week:         parseInt(r.fuel_week, 10),
            total_fuel:   parseFloat(r.total_fuel_liters),
            transactions: parseInt(r.total_transactions, 10),
            approved:     parseInt(r.approved_transactions, 10),
            rejected:     parseInt(r.rejected_transactions, 10),
        }));
    },

    getVehicleInfo: async (plate_number) => {
        const { rows } = await pool.query(
            'SELECT owner_name, status, fuel_quota FROM vehicles WHERE plate_number = $1',
            [plate_number]
        );
        return rows[0] || null;
    },

    getVehicleHistory: async (plate_number) => {
        const { rows } = await pool.query(
            `SELECT id, fuel_amount, fuel_time, approved, rejection_reason
             FROM fuel_transactions
             WHERE plate_number = $1
             ORDER BY fuel_time DESC`,
            [plate_number]
        );
        return rows.map(h => ({
            id:               parseInt(h.id, 10),
            fuel_amount:      parseFloat(h.fuel_amount),
            fuel_time:        h.fuel_time,
            approved:         h.approved === true,
            rejection_reason: h.rejection_reason,
        }));
    },
};

module.exports = ReportModel;