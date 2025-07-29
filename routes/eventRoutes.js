import {Router} from "express";

import {createEvent, getAllEvents, getEventById, updateEvent, deleteEvent ,filterEvent } from "../controller/event.controller.js";

import {tokenVerify} from "../middleware/auth.js";
import{ authorizeRoles }from "../middleware/authorizeRoles.js";


const eventRouter = Router();



eventRouter .post("/create-event", tokenVerify, authorizeRoles("admin", "manager"), createEvent);


eventRouter .get("/events", tokenVerify, authorizeRoles("admin", "manager"), getAllEvents);
eventRouter .get("/event/:id", tokenVerify, authorizeRoles("admin", "manager"), getEventById);
eventRouter .patch("/update-event/:id", tokenVerify, authorizeRoles("admin", "manager"), updateEvent);
eventRouter .delete("/delete-event/:id", tokenVerify, authorizeRoles("admin", "manager"), deleteEvent);

eventRouter.get("/filter-events",filterEvent)

export { eventRouter };


 
