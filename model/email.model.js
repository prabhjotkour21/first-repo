import { Schema, model } from "mongoose";

const emailSchema = new Schema({
  messageId: { type: String, required: true, unique: true },
  subject: { type: String },
  from: { type: String },
  date: { type: String },
  snippet: { type: String },
  label: { type: String },
  userEmail: { type: String, required: true }, 
}, { timestamps: true });

const Email = model("Email", emailSchema);
export { Email };
