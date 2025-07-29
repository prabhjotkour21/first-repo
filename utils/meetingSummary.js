import axios from  "axios"
import "dotenv/config"

export const fetchMeetingSummary=async(meetingId,token,userId)=>{
    try{
       
        const url = `${process.env.BASE_URL}/api/sg/meeting-summary?sessionId=${meetingId}${
            userId ? `&userId=${userId}` : ""
        }`;

        const response=await axios.get(url,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        return response.data
    }catch(error){
        console.log("Utils Error",error.message)
        throw error
    }
}