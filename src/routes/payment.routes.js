import express from 'express';
import { paymentController } from '../controllers/payment.controller.js';

export const router = express.Router();

// Webhook route needs to be raw, but we'll mount it in app.js directly or use a specific middleware.
// If it's mounted here, the parent router must not have parsed JSON already.
// For safety, we often export a standalone router for webhooks to be mounted separately in app.js
// But for standard API endpoints:

router.post('/create-payment-intent', paymentController.createIntent);
router.get('/:bookingId', paymentController.getPaymentStatus);
