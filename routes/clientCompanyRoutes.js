import {Router} from "express"
import {createCompany,getCompanies,updateCompany,deleteCompany} from "../controller/clientCompany.controller.js"
import { tokenVerify } from "../middleware/auth.js";
const clientRouter=Router()

clientRouter.post("/Create",tokenVerify,createCompany)

clientRouter.get("/get",tokenVerify,getCompanies)

clientRouter.patch("/update/:id",tokenVerify,updateCompany)

clientRouter.patch("/delete/:id",tokenVerify,deleteCompany)


export {clientRouter}