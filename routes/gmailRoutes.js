import express from "express";
import {
  createDraft,
  sendEmail,
  getSyncedEmails,
  // readTeamInboxFromGmail,
  readTeamInboxFromDB,
  getSyncedEmailsForSpecific,
  searchEmailForPrompt,
  // getClientEmailConversationsByDeal
} from "../controller/gmail.controller.js";

import {tokenVerify} from "../middleware/auth.js";
import {authorizeRoles} from "../middleware/authorizeRoles.js";
// import {handleGoogleOAuthCallback} from "../utils/googleRefirectURI.js"

const gmailRouter = express.Router();


gmailRouter.get("/synced-emails", getSyncedEmails);


gmailRouter.get("/synced-emails/user/:userEmail",getSyncedEmailsForSpecific)


gmailRouter.post("/create-draft", createDraft);


gmailRouter.post("/send-email", sendEmail);

// gmailRouter.get("/get-mail/:dealId",getClientEmailConversationsByDeal)


gmailRouter.get("/emails-prompt",searchEmailForPrompt)


gmailRouter.get("/team-inbox",tokenVerify,authorizeRoles("manager"),readTeamInboxFromDB
);

export {gmailRouter}
