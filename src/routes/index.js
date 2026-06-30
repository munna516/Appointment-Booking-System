import express from "express";
import { router as authRoutes } from "./auth.routes.js"

const router = express.Router()

router.use('/auth/admin', authRoutes)

export default router
