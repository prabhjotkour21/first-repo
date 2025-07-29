import { getEmailChatInsights } from "../utils/emailChatWrapper.js";
import { sendSuccess } from "../utils/responseHandler.js";

export const getEmailChatSummary=async(req,res,next)=>{
    try{
        const { prompt ,description, product_details, requested_sections}=req.body
        const userEmail=req.user.email
        console.log(userEmail)
        const results=await getEmailChatInsights(
            prompt ,
            description, 
            product_details, 
            requested_sections,
            userEmail
        )
        
        return sendSuccess(res,"Email chat summary generated",results)
    }catch(error){
        console.log("Email Chat Summary Error:", error.message);
        next(error)
    }
}