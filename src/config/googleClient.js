import { google } from 'googleapis';
import { constants } from './constants.js';

if (!constants.google_client_id || !constants.google_client_secret) {
    console.warn("Missing Google Client ID or Secret in environment variables!");
}

// Ensure this matches the Authorized Redirect URI in Google Cloud Console
const REDIRECT_URI = `http://localhost:${constants.port || 3000}/api/v1/auth/google/callback`;

export const oauth2Client = new google.auth.OAuth2(
    constants.google_client_id,
    constants.google_client_secret,
    REDIRECT_URI
);

// If we already have a refresh token saved in .env, set it for future API calls (like creating events)
if (constants.google_refresh_token) {
    oauth2Client.setCredentials({
        refresh_token: constants.google_refresh_token
    });
}
