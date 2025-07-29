import { google } from "googleapis";
import "dotenv/config"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/api/calendar/oauth2callback"
);

export { oauth2Client, google };
