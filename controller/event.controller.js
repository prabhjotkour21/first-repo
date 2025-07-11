import { Event } from "../model/event.model.js";
import { sendSuccess } from "../utils/responseHandler.js";
import * as ERROR from "../common/error_message.js"
// Create Event
// import { syncCalendar } from "../utils/fastapi.service.js";




const createEvent = async (req, res, next) => {
  try {

    const { title, description } = req.body;

    // Validation
    if (!title) throw new Error(ERROR.EVENT_TITLE_REQUIRED);
    if (!description) throw new Error(ERROR.EVENT_DESCRIPTION_REQUIRED);


    const newEvent = new Event({
      title,
      description,
      createdBy: req.user.userId, // userId from verified token
    });

    await newEvent.save();

    return sendSuccess(res, "Event created successfully", newEvent, 201);
  } catch (err) {
    next(err); // Send error to global handler
  }
};
// Get All Events


const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isDeleted: false }).populate(
      "createdBy",
      "name email role"
    );

    if (events.length === 0) {
      throw new Error(ERROR.NO_EVENTS_FOUND); // Optional custom error
    }

    return sendSuccess(res, "Events fetched successfully", events);
  } catch (err) {
    next(err); // Pass to global error handler
  }
};


//  Get Event By ID
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false }).populate("createdBy", "name email role");

    if (!event) {
      throw new Error(ERROR.EVENT_NOT_FOUND);  // Define this in error_message.js
    }

    return sendSuccess(res, "Event fetched successfully", event);
  } catch (err) {
    next(err); // Send to global error handler
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      throw new Error(ERROR.EVENT_NOT_FOUND); // Make sure this is defined
    }

    return sendSuccess(res, "Event updated successfully", { updated });
  } catch (err) {
    next(err); // Pass to global error handler
  }
};

//  Soft Delete Event
const deleteEvent = async (req, res, next) => {
  try {
    const deleted = await Event.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) {
      throw new Error(ERROR.EVENT_NOT_FOUND); // Ensure this is defined in error_message.js
    }

    return sendSuccess(res, "Event soft-deleted successfully", deleted);
  } catch (err) {
    next(err); // Pass to global error handler
  }
};


// Sync Calendar with FastAPI
// export async function syncCalendarHandler(req, res) {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ message: "Missing auth token" });
//     }

//     const data = await syncCalendar(token);
//     return res.status(200).json(data);
//   } catch (err) {
//     return res.status(500).json({ message: "Sync failed", error: err.message });
//   }
// }



export { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };