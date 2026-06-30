import dotenv from "dotenv"

dotenv.config()

export const constants = {
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    gmail_user: process.env.GMAIL_USER,
    gmail_app_password: process.env.GMAIL_APP_PASSWORD,
    admin_email: process.env.ADMIN_EMAIL,
    
    // Google Calendar Credentials
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    google_refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
}