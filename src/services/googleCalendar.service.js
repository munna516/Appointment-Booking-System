import { google } from 'googleapis';
import { constants } from '../config/constants.js';

let calendarClient = null;

if (constants.google_client_id && constants.google_client_secret && constants.google_refresh_token) {
    const oauth2Client = new google.auth.OAuth2(
        constants.google_client_id,
        constants.google_client_secret
    );

    oauth2Client.setCredentials({
        refresh_token: constants.google_refresh_token
    });

    calendarClient = google.calendar({ version: 'v3', auth: oauth2Client });
} else {
    console.warn("Google Calendar credentials missing. Calendar features will be disabled.");
}

export const googleCalendarService = {
    /**
     * Create an event in Google Calendar
     * @param {Object} eventDetails - The event details
     * @param {string} eventDetails.summary - The title of the event
     * @param {string} eventDetails.description - The description
     * @param {string} eventDetails.startTime - ISO string for start time
     * @param {string} eventDetails.endTime - ISO string for end time
     * @param {string} eventDetails.attendeeEmail - Email of the attendee
     */
    createEvent: async (eventDetails) => {
        if (!calendarClient) {
            console.error("Cannot create calendar event: Google Calendar is not configured.");
            return null;
        }

        try {
            const event = {
                summary: eventDetails.summary,
                description: eventDetails.description,
                start: {
                    dateTime: eventDetails.startTime,
                    timeZone: 'Asia/Dhaka', // Configurable timeZone
                },
                end: {
                    dateTime: eventDetails.endTime,
                    timeZone: 'Asia/Dhaka',
                },
                attendees: [
                    { email: eventDetails.attendeeEmail }
                ],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 },
                        { method: 'popup', minutes: 30 },
                    ],
                },
            };

            const response = await calendarClient.events.insert({
                calendarId: 'primary',
                resource: event,
                sendUpdates: 'all', // Send email notification to attendees
            });

            return response.data;
        } catch (error) {
            console.error('Error creating Google Calendar event:', error);
            throw error;
        }
    }
};
