import { paymentService } from '../services/payment.service.js';
import { constants } from '../config/constants.js';
import { stripe } from '../config/stripe.js';

export const paymentController = {
    /**
     * POST /api/payments/create-payment-intent
     */
    createIntent: async (req, res) => {
        try {
            const { serviceId, customerName, customerEmail, customerPhone, bookingDate, startTime, endTime, notes } = req.body;

            // Basic validation
            if (!serviceId || !customerName || !customerEmail || !bookingDate || !startTime || !endTime) {
                return res.status(400).json({ error: "Missing required booking details" });
            }

            const result = await paymentService.createPaymentIntent(req.body);

            return res.status(200).json({
                message: "Payment Intent created successfully",
                clientSecret: result.clientSecret,
                bookingId: result.bookingId
            });
        } catch (error) {
            console.error("Error creating payment intent:", error);
            
            // Send appropriate status code based on error message if needed
            if (error.message === "This time slot is already booked.") {
                return res.status(409).json({ error: error.message });
            }

            return res.status(500).json({ error: "Failed to create payment intent" });
        }
    },

    /**
     * GET /api/payments/:bookingId
     */
    getPaymentStatus: async (req, res) => {
        try {
            const { bookingId } = req.params;
            const status = await paymentService.getPaymentStatusByBookingId(bookingId);
            
            return res.status(200).json(status);
        } catch (error) {
            console.error("Error fetching payment status:", error);
            if (error.message === "Booking not found") {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    /**
     * POST /api/webhooks/stripe
     * Handles Stripe webhook events. MUST receive raw body.
     */
    stripeWebhook: async (req, res) => {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = constants.stripe_webhook_secret;

        let event;

        try {
            // stripe.webhooks.constructEvent expects the raw string/buffer body
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    const succeededIntent = event.data.object;
                    console.log(`PaymentIntent for ${succeededIntent.amount} was successful!`);
                    await paymentService.handleSuccessfulPayment(succeededIntent.id);
                    break;
                
                case 'payment_intent.payment_failed':
                    const failedIntent = event.data.object;
                    console.log(`PaymentIntent ${failedIntent.id} failed.`);
                    await paymentService.handleFailedPayment(failedIntent.id);
                    break;
                
                // Add more cases here as needed
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            // Return a 200 response to acknowledge receipt of the event
            return res.json({received: true});
        } catch (error) {
            console.error("Error processing webhook event:", error);
            // Even if our business logic fails, it's sometimes better to return 200 so Stripe stops retrying,
            // OR return 500 if we want Stripe to retry. Assuming 500 for retry.
            return res.status(500).json({ error: "Failed to process webhook" });
        }
    }
};
