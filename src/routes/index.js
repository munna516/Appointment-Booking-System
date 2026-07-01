import express from "express";
import { router as authRoutes } from "./auth.routes.js"
import { router as contactRoutes } from "./contact.route.js"
import { router as availabilityRoutes } from "./availability.route.js"
import { router as paymentRoutes } from "./payment.routes.js"

const router = express.Router()

router.use('/auth/admin', authRoutes)

router.use('/contact', contactRoutes)
router.use('/availability', availabilityRoutes)
router.use('/payments', paymentRoutes)

export default router
