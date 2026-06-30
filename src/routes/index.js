import express from "express";
import { router as authRoutes } from "./auth.routes.js"
import { router as contactRoutes } from "./contact.route.js"
import { router as availabilityRoutes } from "./availability.route.js"
import { router as googleCalendarRoutes } from "./googleCalendar.route.js"

const router = express.Router()

router.use('/auth/admin', authRoutes)
router.use('/auth/google', googleCalendarRoutes)
router.use('/contact', contactRoutes)
router.use('/availability', availabilityRoutes)

export default router
