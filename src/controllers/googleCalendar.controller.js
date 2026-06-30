import { oauth2Client } from '../config/googleClient.js';

export const googleCalendarController = {
    getAuthUrl: (req, res) => {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline', // Requests a refresh token
            scope: ['https://www.googleapis.com/auth/calendar'], // Exact scope requested
            prompt: 'consent' // Forces consent screen to ensure we get a refresh token
        });

        res.redirect(url);
    },

    oauthCallback: async (req, res) => {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ success: false, message: "No authorization code provided." });
        }

        try {
            const { tokens } = await oauth2Client.getToken(code);
            
            if (tokens.refresh_token) {
                console.log("\n=============================================");
                console.log("🔥 NEW GOOGLE REFRESH TOKEN RECEIVED 🔥");
                console.log("=============================================");
                console.log(tokens.refresh_token);
                console.log("=============================================\n");
                console.log("Please copy the token above and add it to your .env file as GOOGLE_REFRESH_TOKEN\n");
            }

            // Return a JSON response containing the tokens (for development only) as requested
            return res.status(200).json({
                success: true,
                message: "Authentication successful! Check your terminal console for the refresh token.",
                tokens: tokens
            });

        } catch (error) {
            console.error("Error retrieving access token", error);
            res.status(500).json({ success: false, message: "Authentication failed", error: error.message });
        }
    }
};
