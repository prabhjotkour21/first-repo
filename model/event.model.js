import { Schema, model } from "mongoose";

const eventSchema = new Schema({
  summary: { type: String, required: true },
  description: { type: String },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User", // Admin or Manager
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  userEmail: {
    type: String,
    required: true,
  },
  googleEventId: {
    type: String,
    required: true,
  },
  startTime: Date,
  endTime: Date,
  attendees: [String],
  meetingId: {
    type: String,
    default: null, 
  },
  conversationType: {
    type: String,
    enum: ["meet", "impromptu", "whatsapp", "mail"],
    required: true,
  },
  transcript: {
    type: Boolean,
    default: true,
  },
  meetLink: { type: String,default: null, }
}, { timestamps: true });

const Event = model("Event", eventSchema);
export { Event };
