import {Router} from "express";
import {googleCallback,googleLogin} from "../controller/tokenHandler.js"
const router=Router()
router.get("/login", googleLogin);
router.get("/oauth2callback", googleCallback);

export {router}