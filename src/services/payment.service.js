import { prisma } from '../config/dbConfig.js';
import { stripe } from '../config/stripe.js';
import { emailUtils } from '../utils/email.js';

export const paymentService = {
    /**
     * Step 1: Create Payment Intent and Pending Booking/Payment Records
     */
    createPaymentIntent: async (data) => {
        const { serviceId, customerName, customerEmail, customerPhone, bookingDate, startTime, endTime, notes } = data;

        // 1. Validate service exists
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            throw new Error("Service not found");
        }

        if (!service.isActive) {
            throw new Error("Service is not active");
        }

        // 2. Perform optimistic availability check before creating intent
        // Just checking if any confirmed booking already exists for this slot.
        const existingBooking = await prisma.booking.findFirst({
            where: {
                serviceId,
                bookingDate: new Date(bookingDate),
                startTime,
                status: 'CONFIRMED'
            }
        });

        if (existingBooking) {
            throw new Error("This time slot is already booked.");
        }

        // 3. Create Booking & Payment as PENDING using a Transaction
        const transactionResult = await prisma.$transaction(async (tx) => {
            const newBooking = await tx.booking.create({
                data: {
                    serviceId,
                    customerName,
                    customerEmail,
                    customerPhone,
                    bookingDate: new Date(bookingDate),
                    startTime,
                    endTime,
                    notes,
                    status: 'PENDING',
                    paymentStatus: 'PENDING'
                }
            });

            const newPayment = await tx.payment.create({
                data: {
                    bookingId: newBooking.id,
                    amount: service.price,
                    currency: service.currency,
                    status: 'PENDING',
                    stripePaymentIntentId: 'temp_placeholder_' + newBooking.id, // Temporary until intent is created
                    paymentMethod: 'unspecified'
                }
            });

            return { newBooking, newPayment };
        });

        // 4. Create Stripe Payment Intent
        const amountInCents = Math.round(parseFloat(service.price) * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: service.currency.toLowerCase(),
            metadata: {
                bookingId: transactionResult.newBooking.id,
                serviceId: service.id,
                customerEmail: customerEmail
            },
            // Specify automatic_payment_methods to support cards, Apple Pay, Google Pay, etc.
            automatic_payment_methods: {
                enabled: true,
            }
        });

        // 5. Update Payment record with the real Stripe Payment Intent ID
        await prisma.payment.update({
            where: { id: transactionResult.newPayment.id },
            data: { stripePaymentIntentId: paymentIntent.id }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            bookingId: transactionResult.newBooking.id
        };
    },

    /**
     * Step 2: Handle Successful Payment (Webhook)
     */
    handleSuccessfulPayment: async (paymentIntentId) => {
        // Find the payment record
        const payment = await prisma.payment.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
            include: { booking: { include: { service: true } } }
        });

        if (!payment) {
            console.error(`Payment record not found for intent: ${paymentIntentId}`);
            return;
        }

        if (payment.status === 'PAID') {
            console.log(`Payment intent ${paymentIntentId} is already marked as PAID (Idempotency).`);
            return;
        }

        const { booking } = payment;

        // Retrieve actual payment method used from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        let paymentMethodType = 'unknown';
        if (paymentIntent.payment_method) {
            const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
            paymentMethodType = pm.type; // 'card', 'apple_pay', etc.
        }

        // Use Prisma Transaction to handle concurrency / double-bookings securely
        await prisma.$transaction(async (tx) => {
            // 1. Check for conflicting bookings (another booking for the same slot that is CONFIRMED)
            const conflict = await tx.booking.findFirst({
                where: {
                    serviceId: booking.serviceId,
                    bookingDate: booking.bookingDate,
                    startTime: booking.startTime,
                    status: 'CONFIRMED'
                }
            });

            if (conflict) {
                console.warn(`Double booking detected for booking ${booking.id}. Initiating refund.`);
                // If conflict, we must refund this payment immediately via Stripe.
                await stripe.refunds.create({
                    payment_intent: paymentIntentId,
                    reason: 'duplicate'
                });

                // Update DB to reflect refund/cancellation
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: 'REFUNDED', paymentMethod: paymentMethodType }
                });

                await tx.booking.update({
                    where: { id: booking.id },
                    data: { status: 'CANCELLED', paymentStatus: 'REFUNDED', notes: (booking.notes || '') + ' [System: Cancelled due to double-booking conflict]' }
                });

                // Optionally send a refund/apology email here
                return;
            }

            // 2. If no conflict, confirm the booking and payment
            await tx.payment.update({
                where: { id: payment.id },
                data: { status: 'PAID', paymentMethod: paymentMethodType }
            });

            await tx.booking.update({
                where: { id: booking.id },
                data: { status: 'CONFIRMED', paymentStatus: 'PAID' }
            });

            // 3. Send Emails via Resend (After successful commit to DB logic)
            // Note: In strict environments, you might put this in a background queue outside the transaction.
            await emailUtils.sendBookingConfirmation(
                booking.customerEmail,
                booking.customerName,
                booking.service.name,
                booking.bookingDate,
                booking.startTime,
                booking.endTime
            );

            await emailUtils.sendPaymentConfirmation(
                booking.customerEmail,
                booking.customerName,
                payment.amount,
                payment.currency,
                booking.service.name
            );

            await emailUtils.sendAdminNotification(
                booking.customerName,
                booking.customerEmail,
                booking.service.name,
                booking.bookingDate,
                booking.startTime
            );
            
            console.log(`Booking ${booking.id} successfully confirmed and emails sent.`);
        });
    },

    /**
     * Step 3: Handle Failed Payment (Webhook)
     */
    handleFailedPayment: async (paymentIntentId) => {
        const payment = await prisma.payment.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
            include: { booking: true }
        });

        if (!payment) return;

        // Leave booking as PENDING as recommended so they can retry. Just update Payment status to FAILED.
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' }
        });

        // Booking remains PENDING, allowing the customer to create a new intent or try a different card
        // on the frontend without rebuilding their entire booking selection.
        console.log(`Payment ${payment.id} marked as FAILED.`);
    },

    /**
     * Get Payment/Booking Status
     */
    getPaymentStatusByBookingId: async (bookingId) => {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { payment: true }
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        return {
            bookingStatus: booking.status,
            paymentStatus: booking.payment ? booking.payment.status : 'UNKNOWN'
        };
    }
};
