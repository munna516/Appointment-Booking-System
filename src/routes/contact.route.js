import express from "express";
import { contactController } from "../controllers/contact.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { contactValidationSchema } from "../validators/contact.validator.js";

export const router = express.Router()

router.post(
    '/submission', 
    validateRequest(contactValidationSchema.createContact),
    contactController.createContact
)