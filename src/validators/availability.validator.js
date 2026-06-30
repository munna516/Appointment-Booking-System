import { z } from "zod";

const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const availabilityValidationSchema = {
    createAvailability: z.object({
        body: z.object({
            date: z.string({
                message: "Date is required"
            }).regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
            startTime: z.string({
                message: "Start time is required"
            }).regex(timeFormatRegex, "Invalid start time format (HH:MM)"),
            endTime: z.string({
                message: "End time is required"
            }).regex(timeFormatRegex, "Invalid end time format (HH:MM)"),
            isAvailable: z.boolean().optional().default(true)
        })
    }),
    updateAvailability: z.object({
        body: z.object({
            date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
            startTime: z.string().regex(timeFormatRegex, "Invalid start time format (HH:MM)").optional(),
            endTime: z.string().regex(timeFormatRegex, "Invalid end time format (HH:MM)").optional(),
            isAvailable: z.boolean().optional()
        })
    })
};
