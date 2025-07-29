import axios from "axios";
import "dotenv/config";

export const callHelloAPI = async () => {
  try {
    const response = await axios.get(`${process.env.BASE_URL}/auth/check-server`);
    return response.data;
  } catch (error) {
    console.error("Error calling /hello API:", error.message);
    throw error;
  }
};
