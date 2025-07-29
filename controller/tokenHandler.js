
import express from "express";
import { google } from "googleapis";
import { User } from "../model/user.js";
import * as ERROR from "../common/error_message.js";
import { sendSuccess } from "../utils/responseHandler.js";

const router = express.Router();

// ✅ oauth2Client defined globally
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// ✅ LOGIN
export const googleLogin=async (req, res) => {
  const { serviceType = "calendar" } = req.query;

  const scopesMap = {
    calendar: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    gmail: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.send" ,   
      "https://www.googleapis.com/auth/gmail.compose"
    ],
  };

  const scopes = scopesMap[serviceType];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state:serviceType
  });

  res.redirect(url);
}

// ✅ CALLBACK
export const googleCallback =async (req, res,next) => {
  try {
    const { code ,state} = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    // const grantedScopes = tokens.scope || "";
    // console.log("grantedScopes :",grantedScopes)
    // const tokenStore = {};

    // if (grantedScopes.includes("calendar")) {
    //   tokenStore["tokens.calendar"] = tokens;
    // }

    // if (grantedScopes.includes("gmail")) {
    //   tokenStore["tokens.gmail"] = tokens;
    // }

    const tokenStore = {
      [`tokens.${state}`]: tokens,
    };


    await User.findOneAndUpdate(
      { email },
      { email, ...tokenStore },
      { upsert: true, new: true }
    );
    // console.log("tokenStore :",tokenStore)
    res.send("✅ Tokens saved successfully");
  } catch (error) {
    console.error("❌ OAuth Callback Error:", error);
    next(error)
  }
}

export const getValidOAuthClient = async (user, serviceType = "calendar") => {
  const serviceTokens = user.tokens?.[serviceType];

  if (!serviceTokens || !serviceTokens.access_token) {
    throw new Error(`Missing service token for: ${serviceType}`);
  }

  oauth2Client.setCredentials({
    access_token: serviceTokens.access_token,
    refresh_token: serviceTokens.refresh_token,
    expiry_date: serviceTokens.expiry_date, // optional
  });

  // 🔁 Try to refresh token if needed
  try {
    // const newAccessToken = await oauth2Client.getAccessToken();
   const {credentials}=await oauth2Client.refreshAccessToken()
    // new access token and save into db
    // if (newAccessToken.token && newAccessToken.token !== serviceTokens.access_token) {
      await User.findOneAndUpdate(
        { email: user.email },
        {
           [`tokens.${serviceType}.access_token`]: credentials.access_token,
        [`tokens.${serviceType}.expiry_date`]: credentials.expiry_date,
        [`tokens.${serviceType}.scope`]: credentials.scope,
        }
      )
    oauth2Client.setCredentials(credentials)
  } catch (err) {
    console.error("❌ Error refreshing access token:", err.message);
    throw new Error("Failed to refresh access token");
  }

  return oauth2Client;
};

export default router;
