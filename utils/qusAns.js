import axios from "axios"
import "dotenv/config"
export const fetchQAPairs=async(meetingId,eventId,token)=>{
    try{
      
        const response=await axios.get(`${process.env.BASE_URL}/sg/question-answer/${meetingId}/${eventId}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    )
        return response.data
    }catch(error){
        console.log("Failed to fetch QA pairs:",error.message)
        throw error
    }
}