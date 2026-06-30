import { prisma } from '../config/dbConfig.js';
import nodemailer from 'nodemailer';
import { constants } from '../config/constants.js';

// Configure Nodemailer transporter
let transporter = null;
if (constants.gmail_user && constants.gmail_app_password) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: constants.gmail_user,
            pass: constants.gmail_app_password
        }
    });
}

export const contactService = {
    createContact: async (data) => {
        // Save the contact information to the database
        const contact = await prisma.contact.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                subject: data.subject,
                message: data.message,
            }
        });

        // Send an email to the admin using Nodemailer
        if (transporter && constants.admin_email) {
            try {
                await transporter.sendMail({
                    from: `"Appointment Booking" <${constants.gmail_user}>`,
                    to: constants.admin_email,
                    replyTo: contact.email,
                    subject: `New Contact Request: ${contact.subject || 'No Subject'}`,
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaebed; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <div style="background-color: #4F46E5; padding: 25px; text-align: center;">
                                <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">New Contact Request</h2>
                            </div>
                            <div style="padding: 35px; background-color: #ffffff;">
                                <p style="font-size: 15px; color: #4b5563; margin-bottom: 25px; line-height: 1.5;">You have received a new contact form submission from your appointment booking system.</p>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 15px;">
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; width: 35%; color: #6b7280; font-weight: 600;">Name:</td>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-weight: 500;">${contact.name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-weight: 600;">Email:</td>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                                            <a href="mailto:${contact.email}" style="color: #4F46E5; text-decoration: none; font-weight: 500;">${contact.email}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-weight: 600;">Phone:</td>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-weight: 500;">${contact.phone || 'Not provided'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-weight: 600;">Subject:</td>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-weight: 500;">${contact.subject || 'No Subject'}</td>
                                    </tr>
                                </table>

                                <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; border-left: 5px solid #4F46E5;">
                                    <h3 style="margin-top: 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Message</h3>
                                    <p style="color: #4b5563; line-height: 1.7; margin: 0; white-space: pre-wrap; font-size: 15px;">${contact.message}</p>
                                </div>
                            </div>
                            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
                                <p style="margin: 0; font-size: 13px; color: #9ca3af;">This email was sent automatically from your Appointment Booking System.</p>
                            </div>
                        </div>
                    `
                });
            } catch (error) {
                console.error("Failed to send email to admin:", error);
            }
        } else {
            console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is missing. Email was not sent.");
        }

        return contact;
    }
};
