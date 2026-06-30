import { z } from "zod";

export const contactValidationSchema = {
    createContact: z.object({
        body: z.object({
            name: z.string({
                message: "Name is required"
            }).min(1, "Name cannot be empty"),
            email: z.string({
                message: "Email is required"
            }).email("Invalid email address"),
            phone: z.string().optional(),
            subject: z.string().optional(),
            message: z.string({
                message: "Message is required"
            }).min(1, "Message cannot be empty")
        })
    })
};
