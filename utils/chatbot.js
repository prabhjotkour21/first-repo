import axios from "axios"
import "dotenv/config"

export const callChatBotAPI=async(payload)=>{
    try{
        const response=await axios.post(`${process.env.BASE_URL}/chat/chat-bot`,payload)
        return response.data
    }catch(error){
        console.error("Error calling chatbot API:", error.message);
        throw error 
    }
}