import {Router} from "express";
import { googleLogin} from "../controller/googleAuth.js";
import { createOrganization ,getOrganizations,getOrganizationById ,updateOrganization,softDeleteOrganization } from "../controller/organization.js";
import { tokenVerify } from "../middleware/auth.js";
import {signIn ,login,getUserById,deleteUser} from "../controller/auth.js";

import { updateManager } from "../controller/admin.controller.js";


const AuthRouter  = Router();

AuthRouter .post("/auth/google",googleLogin )


AuthRouter .post("/signup", signIn);

AuthRouter .delete("/delete-user/:id",deleteUser)

AuthRouter .post("/login", login);

AuthRouter .get("/user/:id", tokenVerify, getUserById);

AuthRouter .post("/organization/create", tokenVerify, createOrganization);

AuthRouter .get("/organization/get", tokenVerify, getOrganizations);

AuthRouter .get("/organization/get/:id", tokenVerify, getOrganizationById);

AuthRouter .patch("/organization/update/:id", tokenVerify, updateOrganization);

AuthRouter .delete("/organization/delete/:id", tokenVerify, softDeleteOrganization);


AuthRouter .patch("/user-update/:id", tokenVerify, updateManager);
export {AuthRouter }










