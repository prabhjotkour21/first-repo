

import { google } from "googleapis";
import { User } from "../model/user.js";
import { Event } from "../model/event.model.js";
import { getValidOAuthClient } from "./tokenHandler.js";
import * as ERROR from "../common/error_message.js";
import { sendSuccess } from "../utils/responseHandler.js";



export const createEvent= async (req, res, next) => {
  try {
    const { email, summary, description, startTime, endTime, attendees = [],conversationType } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.tokens.calendar?.access_token) {
      throw new Error(ERROR.GOOGLE_AUTH_MISSING);
    }

    const oauth2Client = await getValidOAuthClient(user, "calendar");
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary,
      description,
      start: { dateTime: new Date(startTime), timeZone: "Asia/Kolkata" },
      end: { dateTime: new Date(endTime), timeZone: "Asia/Kolkata" },
      attendees: attendees.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: "meet-" + Date.now(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });
    let meetingId=null
    const meetLink=response.data?.hangoutLink
    if(meetLink){
      const match=meetLink.match(/\/([a-zA-Z0-9\-]+)$/)
      if(match){
        meetingId=match[1]
      }
    }
    // save in db
    await Event.create({
      userEmail: email,
      googleEventId: response.data.id,
      summary,
      description,
      startTime,
      endTime,
      attendees,
      createdBy: user._id,
      isDeleted: false, 
      meetingId,
      conversationType, 
      meetLink: response.data?.hangoutLink ||  "Not available",
    });
    return sendSuccess(res, "Event created successfully", {
          htmlLink: response.data.htmlLink,
          meetLink: response.data?.hangoutLink || "Not available",
        })
     
  } catch (error) {
    console.error("❌ Create Event Error:", error);
    next(error);
  }
}


export const updateEvent=async (req, res, next) => {
  try {
    const { email, eventId, summary, description, startTime, endTime, attendees = [] } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.tokens.calendar?.access_token) {
      throw new Error(ERROR.GOOGLE_AUTH_MISSING);
    }

    const oauthClient = await getValidOAuthClient(user, "calendar");
    const calendar = google.calendar({ version: "v3", auth: oauthClient });

    // 🔍 Get existing event
    const { data: existing } = await calendar.events.get({
      calendarId: "primary",
      eventId,
    });

    // 🛠️ Prepare updated event
    const updatedEvent = {
      summary: summary || existing.summary,
      description: description || existing.description,
      start: {
        dateTime: startTime ? new Date(startTime).toISOString() : existing.start.dateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endTime ? new Date(endTime).toISOString() : existing.end.dateTime,
        timeZone: "Asia/Kolkata",
      },
      attendees: attendees.length ? attendees.map(email => ({ email })) : existing.attendees || [],
    };

    // 🔁 Update on Google Calendar
    const { data: updated } = await calendar.events.update({
      calendarId: "primary",
      eventId,
      requestBody: updatedEvent,
      sendUpdates: "all",
    });

    // Update local DB
    await Event.findOneAndUpdate(
      { googleEventId: eventId },
      {
        summary: updated.summary,
        description: updated.description,
        startTime: new Date(updated.start.dateTime),
        endTime: new Date(updated.end.dateTime),
        attendees: updated.attendees.map(a => a.email),
      }
    );
  return sendSuccess(res, "Event updated successfully.", {
        htmlLink: updated.htmlLink,
      });
    

  } catch (error) {
    console.error("❌ Update Event Error:", error.message);
    next(error);
  }
}


export const deleteGoogleEvent= async(req, res, next) => {
  try {
    const { email, eventId } = req.body;

    const user = await User.findOne({ email });
     if (!user || !user.tokens.calendar?.access_token) {
      throw new Error(ERROR.GOOGLE_AUTH_MISSING);
    }

    const oauth2Client = await getValidOAuthClient(user, "calendar");
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // 🗑️ Step 1: Delete from Google Calendar
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
      sendUpdates: "all", // Optional: Notify attendees of cancellation
    });

    // 🗑️ Step 2: Delete from MongoDB
    const updateUser=await Event.findOneAndUpdate(
      { googleEventId: eventId },
      { isDeleted: true }
    );
 
    return sendSuccess(res, "Event deleted from Google Calendar.", {
      eventId: updateUser.googleEventId,
      email: user.email,
    });

 
  } catch (error) {
    console.error(" Delete Event Error:", error.message);
    next(error);
  }
}



export const readTeamCalendarFromGoogle = async (req, res,next) => {
  try {
    const managerId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const manager = await User.findById(managerId);
    if (!manager) {
      throw new Error(ERROR.MANAGER_NOT_FOUND);
    }

    const teamMembers = await User.find({ inviteBy: managerId });

    // Manager + Team
    const allMembers = [manager, ...teamMembers];

    const results = [];

    for (const member of allMembers) {
      if (!member.tokens?.calendar) continue;

      const oauthClient = await getValidOAuthClient(member, "calendar");
      const calendar = google.calendar({ version: "v3", auth: oauthClient });

      try {
        const response = await calendar.events.list({
          calendarId: member.email,
          timeMin: new Date().toISOString(),
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 2500,
        });

        const events = response.data.items || [];

        const formatDate = (raw) => {
          if (!raw) return "N/A";
          const date = new Date(raw);
          return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          });
        };

        for (const event of events) {
          const startRaw = event.start?.dateTime || event.start?.date || null;
          const endRaw = event.end?.dateTime || event.end?.date || null;

          results.push({
            email: member.email,
            summary: event.summary || "No title",
            description: event.description || "No description",
            start: {
              readable: formatDate(startRaw),
            },
            end: {
              readable: formatDate(endRaw),
            },
            hangoutLink: event.hangoutLink || null,
          });
        }
      } catch (err) {
        console.error(`❌ Error fetching events for ${member.email}:`, err.message);
      }
    }

    // Sort all events by start date
    results.sort((a, b) => new Date(a.start.raw) - new Date(b.start.raw));

    // Pagination logic
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + Number(limit));

    return sendSuccess(res, "Upcoming events for manager and team", {
      totalEvents: results.length,
      page: Number(page),
      limit: Number(limit),
      events: paginatedResults,
    });

  } catch (error) {
    console.error("❌ Team calendar fetch error:", error.message);
    next(error)
  }
};

