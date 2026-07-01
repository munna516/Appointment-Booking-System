import dotenv from "dotenv"

dotenv.config()

export const constants = {
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    gmail_user: process.env.GMAIL_USER,
    gmail_app_password: process.env.GMAIL_APP_PASSWORD,
    admin_email: process.env.ADMIN_EMAIL,
    
    // Stripe
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    
    // Resend
    resend_api_key: process.env.RESEND_API_KEY,
}