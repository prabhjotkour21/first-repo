import axios from  "axios"
import "dotenv/config"

export const callRevenueAPI=async(organizationId, token)=>{
    // console.log(organizationId, token)
    try{
        const response = await axios.get(`${process.env.BASE_URL}/chat/revenue-summary/${organizationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
        return response.data
    }catch(error){
       console.error("Error calling revenue API:", error.message);
        throw error  
    }
   
}
