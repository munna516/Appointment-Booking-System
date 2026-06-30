import express from "express";
import { router as authRoutes } from "./auth.routes.js"
import { router as contactRoutes } from "./contact.route.js"

const router = express.Router()

router.use('/auth/admin', authRoutes)

router.use('/contact',contactRoutes)

export default router
