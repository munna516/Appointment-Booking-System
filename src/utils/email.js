import nodemailer from 'nodemailer';
import { constants } from '../config/constants.js';

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: constants.gmail_user,
        pass: constants.gmail_app_password
    }
});

// Verify connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.warn("Nodemailer configuration error. Emails may not be sent:", error.message);
    } else {
        console.log("Server is ready to take our messages");
    }
});

const defaultFromEmail = constants.gmail_user;

export const emailUtils = {
    /**
     * Send Booking Confirmation to Customer
     */
    sendBookingConfirmation: async (customerEmail, customerName, serviceName, bookingDate, startTime, endTime) => {
        if (!constants.gmail_user || !constants.gmail_app_password) return;

        try {
            await transporter.sendMail({
                from: defaultFromEmail,
                to: customerEmail,
                subject: `Booking Confirmed: ${serviceName}`,
                html: `
                    <h2>Hello ${customerName},</h2>
                    <p>Your booking for <strong>${serviceName}</strong> has been successfully confirmed.</p>
                    <p><strong>Date:</strong> ${new Date(bookingDate).toDateString()}</p>
                    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
                    <p>Thank you for booking with us!</p>
                `
            });
            console.log(`Booking confirmation email sent to ${customerEmail}`);
        } catch (error) {
            console.error("Error sending booking confirmation email:", error);
        }
    },

    /**
     * Send Payment Confirmation to Customer
     */
    sendPaymentConfirmation: async (customerEmail, customerName, amount, currency, serviceName) => {
        if (!constants.gmail_user || !constants.gmail_app_password) return;

        try {
            await transporter.sendMail({
                from: defaultFromEmail,
                to: customerEmail,
                subject: `Payment Received: ${serviceName}`,
                html: `
                    <h2>Hello ${customerName},</h2>
                    <p>We have successfully received your payment of <strong>${amount} ${currency.toUpperCase()}</strong> for <strong>${serviceName}</strong>.</p>
                    <p>Your payment receipt has been generated.</p>
                `
            });
            console.log(`Payment confirmation email sent to ${customerEmail}`);
        } catch (error) {
            console.error("Error sending payment confirmation email:", error);
        }
    },

    /**
     * Send Booking Notification to Admin
     */
    sendAdminNotification: async (customerName, customerEmail, serviceName, bookingDate, startTime) => {
        if (!constants.gmail_user || !constants.gmail_app_password) return;
        
        const adminEmail = constants.admin_email;
        if (!adminEmail) return;

        try {
            await transporter.sendMail({
                from: defaultFromEmail,
                to: adminEmail,
                subject: `New Booking: ${serviceName}`,
                html: `
                    <h2>New Booking Received!</h2>
                    <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
                    <p><strong>Service:</strong> ${serviceName}</p>
                    <p><strong>Date:</strong> ${new Date(bookingDate).toDateString()}</p>
                    <p><strong>Time:</strong> ${startTime}</p>
                    <p>The customer has successfully completed their payment.</p>
                `
            });
            console.log(`Admin notification email sent to ${adminEmail}`);
        } catch (error) {
            console.error("Error sending admin notification email:", error);
        }
    }
};
