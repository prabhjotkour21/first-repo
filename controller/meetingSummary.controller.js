import {fetchMeetingSummary} from "../utils/meetingSummary.js"
import * as ERROR from "../common/error_message.js";
import { sendSuccess} from "../utils/responseHandler.js";

export const getMeetingSummaryHandler=async(req,res,next)=>{
    const {meetingId}=req.params  
    // console.log(meetingId) 
    try{
        console.log(req.body)
        console.log()
        if(!meetingId){
           throw new Error(ERROR.MEETING_ID_MISSING) 
        }
        const token=req.user
     
        const userId=token?.userId
       
        console.log("userId",userId)
           console.log("token",token)
        const data=await fetchMeetingSummary(meetingId,token,userId)
        return sendSuccess(res,data)
    }catch(error){
        console.log("Meeting Summary Error:",error.message)
        next(error)
    }
}