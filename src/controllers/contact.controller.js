import { contactService } from "../services/contact.service.js";

export const contactController = {
    createContact: async (req, res) => {
        try {
            const { name, email, phone, subject, message } = req.body;

            const contact = await contactService.createContact({ name, email, phone, subject, message });

            return res.status(201).json({
                success: true,
                message: "Contact message sent successfully",
                data: contact,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error("Error creating contact:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error while creating contact",
                error: error.message
            });
        }
    }
}