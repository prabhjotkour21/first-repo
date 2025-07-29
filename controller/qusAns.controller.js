import {fetchQAPairs} from "../utils/qusAns.js"

import * as ERROR from "../common/error_message.js";
import { sendSuccess} from "../utils/responseHandler.js";


export const getQAPairsHandler=async(req,res,next)=>{
    try{
        const {meetingId,eventId}=req.params
        // console.log(meetingId,eventId)
        const token = req.headers.authorization.split(" ")[1];
        // console.log(token)
       
        const qaPairs=await fetchQAPairs(meetingId,eventId,token)
        return sendSuccess(res,"QA handler connected successfully",qaPairs)
    }catch(error){
        console.log("Error in QA handler:",error.message)
        next(error)
    }
}