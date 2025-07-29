import {callChatBotAPI} from "../utils/chatbot.js"

import * as ERROR from "../common/error_message.js";
import { sendSuccess} from "../utils/responseHandler.js";

export const getChatSummary=async(req,res,next)=>{
    try{
        const payload= { message: req.body.message };
        console.log(payload)           
        if(!payload){
            throw new Error(ERROR.INVALID_PAYLOAD)
        }
        const result=await callChatBotAPI(payload)

        return sendSuccess(res,"ChatBot response success",result)

    }catch(error){
        console.log("ChatBot API failed",error.message)
        next(error)
    }
}