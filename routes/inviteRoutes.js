import { Router } from "express";
import { inviteUsers } from "../controller/invite.controller.js";
import { tokenVerify } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const inviteRouter = Router();

inviteRouter.post(
  "/",
  tokenVerify,
  authorizeRoles("manager", "admin"),
  inviteUsers
);

export { inviteRouter };
