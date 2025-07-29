
import {Router} from "express";
import multer from "multer";
import { finalizeSessionHandler } from "../controller/finalize.controller.js";
import { joinMeetingHandler } from "../controller/join.controller.js";

import { getMeetingSummaryHandler } from "../controller/meetingSummary.controller.js";
import { tokenVerify } from "../middleware/auth.js";

import {getChatSummary} from "../controller/chatbot.controller.js"

import { getRevenueSummary } from "../controller/revenue.controller.js";

import {authorizeRoles} from "../middleware/authorizeRoles.js";

import {getConversationInsightHandler} from "../controller/conversation.controller.js"

import { getEmailChatSummary } from "../controller/emailChat.controller.js";

import {getQAPairsHandler}from "../controller/qusAns.controller.js";

const fastAPIRouter =Router();
const upload = multer({ dest: "uploads/" });

fastAPIRouter.post("/finalize-session", upload.single("file"), finalizeSessionHandler);
// finalizeRouter.post("/finalize-session", finalizeSessionHandler);

fastAPIRouter.post("/join-meeting", joinMeetingHandler);

fastAPIRouter.get("/fetch-summary/:meetingId",tokenVerify,getMeetingSummaryHandler)

fastAPIRouter.post("/chatbot",getChatSummary)


fastAPIRouter.get("/revenue-summary",tokenVerify,getRevenueSummary)


fastAPIRouter.get('/conversation-insights',tokenVerify, getConversationInsightHandler);

fastAPIRouter.post("/email-chat",tokenVerify,getEmailChatSummary);

fastAPIRouter.get("/qus-ans/:meetingId/:eventId",tokenVerify,getQAPairsHandler)

export  {fastAPIRouter}
