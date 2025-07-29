import cron from "node-cron";
import { google } from "googleapis";
import { Email } from "../model/email.model.js";
import { User } from "../model/user.js";
import { Event } from "../model/event.model.js";
import { getValidOAuthClient } from "../controller/tokenHandler.js";

export const startEmailSyncCron = () => {
  console.log("CRON:Email Syncing start ")

  cron.schedule("*/30 * * * *", async () => {
    console.log("⏰ CRON: Syncing emails...");

    try {
      // console.log("1")
      const users = await User.find({ "tokens.gmail.access_token":  { $exists: true }});
      // console.log(users)
    for (const user of users) {
      const tokens = user.tokens?.gmail
      // console.log(tokens)
      if (!tokens || !tokens.access_token) {
        console.log(`⚠️ Skipping user ${user.email} — No email token found`);
        continue;
      }

  const oauth2Client = await getValidOAuthClient(user, "gmail");
  // console.log(oauth2Client)
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const userEmail = user.email; // Use correct field

  const labels = ["INBOX", "SPAM", "SENT", "IMPORTANT"];

  for (const label of labels) {
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50,
      labelIds: [label],
    });

    const messages = listRes.data.messages || [];

    for (const msg of messages) {
      try{
        const ans=await gmail.users.messages.get({
          userId:"me",
          id:msg.id,
        })
        const detail=ans.data
         if (!detail.payload) {
                console.warn(`⚠️ Skipping message ${msg.id} — No payload`);
                continue;
        }
        const headers = detail.payload.headers||[]
        const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const date = headers.find((h) => h.name === "Date")?.value || "";

      await Email.updateOne(
        { messageId: msg.id },
        {
          messageId: msg.id,
          subject,
          from,
          date,
          snippet: detail?.snippet||"",
          label,
          userEmail,
        },
        { upsert: true }
      );
      }catch(msgError){
        console.error(`❌ Error processing message ${msg.id}:`, msgError.message);
              continue;
      }
    }
  }
   console.log(`✅ Synced email for user: ${user.email}`);
}
      
    } catch (err) {
      console.error("❌ CRON Error in Email:", err.message);
    }
  });
};


export const syncGoogleCalendarEvents =  () => {
  console.log("🔄 Running Google Calendar Sync...");
  cron.schedule("*/30 * * * *",async () => {

  try {
    const users = await User.find({ "tokens.calendar.access_token": { $exists: true } });
    for (const user of users) {
       const tokens = user.tokens?.calendar;
       if (!tokens || !tokens.access_token) {
    console.log(`⚠️ Skipping user ${user.email} — No calendar token found`);
    continue;
  }
      const auth = await getValidOAuthClient(user, "calendar");
      const calendar = google.calendar({ version: "v3", auth });

      // 1. Get upcoming events from Google
      const googleEvents = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: "startTime",
      });

      const googleEventIds = [];

      for (const gEvent of googleEvents.data.items) {
        googleEventIds.push(gEvent.id);

        const attendees = (gEvent.attendees || []).map(a => a.email);

        const meetLink=gEvent.hangoutLink||null
        let meetingId=null
        if(meetLink){
          const match=meetLink.match(/\/([a-zA-Z0-9\-]+)$/)
          if(match){
            meetingId=match[1]
          }
        }
        // console.log(meetLink)
        await Event.findOneAndUpdate(
          { googleEventId: gEvent.id },
          {
            googleEventId: gEvent.id,
            summary: gEvent.summary || "",
            description: gEvent.description || "",
            startTime: new Date(gEvent.start.dateTime || gEvent.start.date),
            endTime: new Date(gEvent.end.dateTime || gEvent.end.date),
            attendees: attendees,
            userEmail: user.email,
            createdBy: user._id,
            isDeleted: false,
            meetLink,
            meetingId
          },
          { upsert: true, new: true }
        );
      }

      // 2. Soft delete events in DB that were removed from Google Calendar
      await Event.updateMany(
        {
          userEmail: user.email,
          googleEventId: { $nin: googleEventIds },
          isDeleted: false,
        },
        { $set: { isDeleted: true } }
      );

      console.log(`✅ Synced events for user: ${user.email}`);
    }
  } catch (error) {
    console.error("❌ Cron Error in calendar:", error.message);
  }
})
};
