import dotenv from "dotenv"

dotenv.config()

export const constants = {
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
}