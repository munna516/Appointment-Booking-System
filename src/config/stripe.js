import Stripe from 'stripe';
import { constants } from './constants.js';

if (!constants.stripe_secret_key) {
    console.warn("Stripe Secret Key is missing from environment variables!");
}

export const stripe = new Stripe(constants.stripe_secret_key, {
    apiVersion: '2023-10-16', // Use the latest stable version or match project setup
});
