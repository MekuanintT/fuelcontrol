const VehicleModel = require('../models/vehicleModel');

const VehicleController = {
    getAll: async (req, res) => {
        const vehicleId = req.query.id;
        try {
            if (vehicleId) {
                const vehicle = await VehicleModel.findById(parseInt(vehicleId, 10));
                if (!vehicle) {
                    return res.status(404).json({ success: false, message: 'Vehicle not found' });
                }
                return res.json({ success: true, data: vehicle });
            }
            const vehicles = await VehicleModel.findAll();
            res.json({ success: true, data: vehicles });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to fetch vehicles: ' + err.message });
        }
    },

    create: async (req, res) => {
        const { plate_number, owner_name, fuel_quota, waiting_hours, status } = req.body;
        if (!plate_number || !owner_name) {
            return res.status(400).json({ success: false, message: 'plate_number and owner_name are required' });
        }

        try {
            const activeStatus = status || 'ACTIVE';
            if (!['ACTIVE', 'BLOCKED'].includes(activeStatus)) {
                return res.status(400).json({ success: false, message: 'Invalid status value' });
            }

            const result = await VehicleModel.create({
                plate:   plate_number.toUpperCase().trim(),
                owner:   owner_name.trim(),
                quota:   parseFloat(fuel_quota ?? 100.00),
                waiting: parseInt(waiting_hours ?? 24, 10),
                status:  activeStatus,
            });
            res.json({ success: true, message: 'Vehicle registered successfully', id: result.id });
        } catch (err) {
            res.status(400).json({ success: false, message: 'Failed to create vehicle: ' + err.message });
        }
    },

    update: async (req, res) => {
        const vehicleId = parseInt(req.params.id, 10);
        const { plate_number, owner_name, fuel_quota, waiting_hours, status } = req.body;

        if (!plate_number || !owner_name) {
            return res.status(400).json({ success: false, message: 'plate_number and owner_name are required' });
        }

        try {
            const activeStatus = status || 'ACTIVE';
            if (!['ACTIVE', 'BLOCKED'].includes(activeStatus)) {
                return res.status(400).json({ success: false, message: 'Invalid status value' });
            }

            const rowCount = await VehicleModel.update(vehicleId, {
                plate:   plate_number.toUpperCase().trim(),
                owner:   owner_name.trim(),
                quota:   parseFloat(fuel_quota ?? 100.00),
                waiting: parseInt(waiting_hours ?? 24, 10),
                status:  activeStatus,
            });

            if (rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Vehicle not found' });
            }
            res.json({ success: true, message: 'Vehicle updated successfully' });
        } catch (err) {
            res.status(400).json({ success: false, message: 'Failed to update vehicle: ' + err.message });
        }
    },

    patchStatus: async (req, res) => {
        const vehicleId = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (!status || !['ACTIVE', 'BLOCKED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing status' });
        }

        try {
            const rowCount = await VehicleModel.updateStatus(vehicleId, status);
            if (rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Vehicle not found' });
            }
            res.json({ success: true, message: 'Vehicle status updated to ' + status });
        } catch (err) {
            res.status(400).json({ success: false, message: 'Failed to toggle vehicle status: ' + err.message });
        }
    },

    delete: async (req, res) => {
        const vehicleId = parseInt(req.params.id, 10);
        try {
            const rowCount = await VehicleModel.delete(vehicleId);
            if (rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Vehicle not found' });
            }
            res.json({ success: true, message: 'Vehicle deleted', deleted: rowCount });
        } catch (err) {
            res.status(400).json({ success: false, message: 'Failed to delete vehicle: ' + err.message });
        }
    },
};

module.exports = VehicleController;