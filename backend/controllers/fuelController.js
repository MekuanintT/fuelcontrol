const pool    = require('../config/db');
const FuelModel    = require('../models/fuelModel');
const VehicleModel = require('../models/vehicleModel');

const FuelController = {
    getAll: async (req, res) => {
        const txId = req.query.id;
        try {
            if (txId) {
                const tx = await FuelModel.findById(parseInt(txId, 10));
                if (!tx) {
                    return res.status(404).json({ success: false, message: 'Transaction not found' });
                }
                return res.json({ success: true, data: tx });
            }
            const page = Math.max(1, parseInt(req.query.page || '1', 10));
            const rows = await FuelModel.findAll(page);
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to fetch transactions: ' + err.message });
        }
    },

    requestFuel: async (req, res) => {
        const { plate_number, fuel_amount } = req.body;
        if (!plate_number || fuel_amount === undefined) {
            return res.status(400).json({
                recorded: false,
                approved: false,
                message:  'Plate number and fuel amount are required',
            });
        }

        const plate  = plate_number.trim();
        const amount = parseFloat(fuel_amount);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const vehicle = await VehicleModel.findByPlate(plate, client);
            if (!vehicle) {
                await client.query('ROLLBACK');
                return res.json({ recorded: false, approved: false, message: 'Transaction rejected: Vehicle not found' });
            }

            let approved        = true;
            let rejectionReason = null;

            // Rule 1: Status Check
            if (vehicle.status === 'BLOCKED') {
                approved        = false;
                rejectionReason = 'Vehicle is blocked';
            }

            // Rule 2: Cooldown / Waiting Hours Check
            if (approved) {
                const allTx = await FuelModel.findApprovedByPlate(plate, client);

                if (allTx.length > 0) {
                    const now          = new Date();
                    const lastTxTime   = new Date(allTx[0].fuel_time);
                    const diffHours    = (now - lastTxTime) / (1000 * 60 * 60);
                    const waitingHours = parseInt(vehicle.waiting_hours, 10);

                    let transactionsInWindow = 0;
                    allTx.forEach(tx => {
                        const hoursSinceTx = (now - new Date(tx.fuel_time)) / (1000 * 60 * 60);
                        if (hoursSinceTx < waitingHours) transactionsInWindow++;
                    });

                    if (transactionsInWindow >= 2 && diffHours < waitingHours) {
                        approved        = false;
                        rejectionReason = `Waiting hours interval not met. Must wait ${(waitingHours - diffHours).toFixed(1)} more hours`;
                    }
                }
            }

            // Rule 3: Anti-Duplicate Prevention (10 seconds)
            if (approved) {
                const dupRows = await FuelModel.findDuplicateRecent(plate, amount, client);
                if (dupRows.length > 0) {
                    approved        = false;
                    rejectionReason = 'Duplicate transaction detected. Please wait 10 seconds';
                }
            }

            // Rule 4: Daily Quota Limit Check
            if (approved) {
                const totalToday = await FuelModel.getTodayTotal(plate, client);
                const quotaLimit = parseFloat(vehicle.fuel_quota);

                if (totalToday + amount > quotaLimit) {
                    approved        = false;
                    rejectionReason = `Fuel quota exceeded. Today's usage: ${totalToday.toFixed(2)} L. Limit: ${quotaLimit.toFixed(2)} L`;
                }
            }

            const inserted = await FuelModel.insert(plate, amount, approved, rejectionReason, client);
            await client.query('COMMIT');

            res.json({
                recorded:       true,
                approved,
                transaction_id: inserted.id,
                message:        approved
                    ? 'Transaction approved successfully'
                    : 'Transaction rejected: ' + rejectionReason,
            });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({ recorded: false, approved: false, message: 'Database error: ' + err.message });
        } finally {
            client.release();
        }
    },

    delete: async (req, res) => {
        const txId = parseInt(req.params.id, 10);
        try {
            const rowCount = await FuelModel.delete(txId);
            if (rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Transaction not found' });
            }
            res.json({ success: true, message: 'Transaction deleted', deleted: rowCount });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to delete transaction: ' + err.message });
        }
    },
};

module.exports = FuelController;