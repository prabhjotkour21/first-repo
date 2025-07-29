import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true, // usually emails are unique
    },
    isValidated: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "member"],
      default: "member", // default role is teamLead
    },
    isOrganization: {
      type: Number,
      default: 0, // 0 = no organization created, 1 = organization created
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    socialId: {
      type: String, // Google `sub` ID
    },
    picture: {
      type: String, // Google profile image URL
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization", // This links user to an organization
      default: null,
    },
    inviteBy: {
      default: null,
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    tokens: {
      gmail: {
        access_token: String,
        refresh_token: String,
        scope: String,
        token_type: String,
        expiry_date: Number,
      },
      calendar: {
        access_token: String,
        refresh_token: String,
        scope: String,
        token_type: String,
        expiry_date: Number,
      },
    },
  },
  { timestamps: true }
);

// Create the model
const User = model("User", userSchema);

export { User };
