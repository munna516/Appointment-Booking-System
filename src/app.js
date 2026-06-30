import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js"

export const app = express()

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}))

app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())


app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', routes)


app.get('/', (req, res) => {
    res.json({
        message: "Appointment Booking Backend System is running",
        status: "OK",
        timestamp: new Date().toISOString()
    })
})

// Health check
app.get("/health", (req, res) => {
    res.json({
        message: "Appointment Booking Backend is online",
        status: "OK",
        timestamp: new Date().toISOString()
    })
})

