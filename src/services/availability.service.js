import { prisma } from '../config/dbConfig.js';

export const availabilityService = {
    createAvailability: async (data) => {
        // Ensure date is a valid Date object for Prisma
        const dateObj = new Date(data.date);

        // Prevent overlapping availabilities for the same date (basic validation)
        const existing = await prisma.availability.findFirst({
            where: {
                date: dateObj,
                OR: [
                    {
                        AND: [
                            { startTime: { lte: data.endTime } },
                            { endTime: { gte: data.startTime } }
                        ]
                    }
                ]
            }
        });

        if (existing) {
            throw new Error("Overlapping availability exists for this date and time.");
        }

        return await prisma.availability.create({
            data: {
                ...data,
                date: dateObj
            }
        });
    },

    getAllAvailabilities: async (queryDate) => {
        const whereClause = {};
        if (queryDate) {
            whereClause.date = new Date(queryDate);
        }

        return await prisma.availability.findMany({
            where: whereClause,
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' }
            ]
        });
    },

    updateAvailability: async (id, data) => {
        const existing = await prisma.availability.findUnique({ where: { id } });
        if (!existing) {
            throw new Error("Availability not found");
        }

        const updateData = { ...data };
        if (updateData.date) {
            updateData.date = new Date(updateData.date);
        }

        return await prisma.availability.update({
            where: { id },
            data: updateData
        });
    },

    deleteAvailability: async (id) => {
        const existing = await prisma.availability.findUnique({ where: { id } });
        if (!existing) {
            throw new Error("Availability not found");
        }

        return await prisma.availability.delete({
            where: { id }
        });
    }
};
