import express from 'express';
import { availabilityController } from '../controllers/availability.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { availabilityValidationSchema } from '../validators/availability.validator.js';

export const router = express.Router();

router.post('/', validateRequest(availabilityValidationSchema.createAvailability), availabilityController.createAvailability);
router.get('/', availabilityController.getAllAvailabilities);
router.patch('/:id', validateRequest(availabilityValidationSchema.updateAvailability), availabilityController.updateAvailability);
router.delete('/:id', availabilityController.deleteAvailability);
