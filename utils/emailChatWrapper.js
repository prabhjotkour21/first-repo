import axios from "axios"
import "dotenv/config"
export const getEmailChatInsights=async(prompt, description, product_details, requested_sections,userEmail)=>{
    try{
        const response=await axios.post(`${process.env.BASE_URL}/chat/email-bot`,{
            prompt,
            description,
            product_details,
            requested_sections,
            userEmail
        })
        return response.data
    }catch(error){
        console.error("Error calling Python EmailBot API:", error.message);
        throw new Error(error.response?.data?.detail || error.message);
    }
}