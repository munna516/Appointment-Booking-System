import { availabilityService } from '../services/availability.service.js';

export const availabilityController = {
    createAvailability: async (req, res) => {
        try {
            const availability = await availabilityService.createAvailability(req.body);
            return res.status(201).json({
                success: true,
                message: "Availability created successfully",
                data: availability
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to create availability"
            });
        }
    },

    getAllAvailabilities: async (req, res) => {
        try {
            const availabilities = await availabilityService.getAllAvailabilities(req.query.date);
            return res.status(200).json({
                success: true,
                data: availabilities
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error while fetching availabilities"
            });
        }
    },

    updateAvailability: async (req, res) => {
        try {
            const availability = await availabilityService.updateAvailability(req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: "Availability updated successfully",
                data: availability
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to update availability"
            });
        }
    },

    deleteAvailability: async (req, res) => {
        try {
            await availabilityService.deleteAvailability(req.params.id);
            return res.status(200).json({
                success: true,
                message: "Availability deleted successfully"
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to delete availability"
            });
        }
    }
};
