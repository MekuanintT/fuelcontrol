const ReportModel = require('../models/reportModel');

const ReportController = {
    getReport: async (req, res) => {
        const { type, plate_number } = req.query;

        switch (type) {
            case 'daily': {
                try {
                    const report = await ReportModel.getDailyReport();
                    res.json({ success: true, report });
                } catch (err) {
                    res.status(500).json({ success: false, message: 'Failed to generate daily report: ' + err.message });
                }
                break;
            }

            case 'weekly': {
                try {
                    const report = await ReportModel.getWeeklyReport();
                    res.json({ success: true, report });
                } catch (err) {
                    res.status(500).json({ success: false, message: 'Failed to generate weekly report: ' + err.message });
                }
                break;
            }

            case 'vehicle': {
                if (!plate_number) {
                    return res.status(400).json({ success: false, message: 'Missing plate_number parameter' });
                }
                try {
                    const vehicle = await ReportModel.getVehicleInfo(plate_number);
                    if (!vehicle) {
                        return res.status(404).json({ success: false, message: 'Vehicle not found' });
                    }
                    const history = await ReportModel.getVehicleHistory(plate_number);
                    res.json({
                        success: true,
                        vehicle: {
                            plate_number,
                            owner_name: vehicle.owner_name,
                            status:     vehicle.status,
                            fuel_quota: parseFloat(vehicle.fuel_quota),
                        },
                        history,
                    });
                } catch (err) {
                    res.status(500).json({ success: false, message: 'Failed to fetch vehicle history: ' + err.message });
                }
                break;
            }

            default:
                res.status(400).json({
                    success: false,
                    message: 'Invalid report type specified (must be daily, weekly, or vehicle)',
                });
        }
    },
};

module.exports = ReportController;