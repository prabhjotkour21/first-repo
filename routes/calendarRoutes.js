import {Router} from "express";
import {

  createEvent,
  updateEvent,
  deleteGoogleEvent,
  readTeamCalendarFromGoogle
} from "../controller/calendar.controller.js";

import {tokenVerify} from "../middleware/auth.js";
import {authorizeRoles} from "../middleware/authorizeRoles.js";

const calendarRouter = Router();

calendarRouter.post("/create-event", createEvent);
calendarRouter.patch("/update-event",updateEvent)
calendarRouter.delete("/delete-event",deleteGoogleEvent)

// manager routes

calendarRouter.get("/team",tokenVerify,authorizeRoles("manager"),readTeamCalendarFromGoogle)

export {calendarRouter}
