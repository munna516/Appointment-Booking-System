import dotenv from "dotenv"

dotenv.config()

export const constants = {
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    gmail_user: process.env.GMAIL_USER,
    gmail_app_password: process.env.GMAIL_APP_PASSWORD,
    admin_email: process.env.ADMIN_EMAIL,
}