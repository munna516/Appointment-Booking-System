import express from 'express';
import { googleCalendarController } from '../controllers/googleCalendar.controller.js';

export const router = express.Router();

router.get('/', googleCalendarController.getAuthUrl);
router.get('/callback', googleCalendarController.oauthCallback);
