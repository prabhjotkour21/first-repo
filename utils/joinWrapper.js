// utils/joinWrapper.js
import axios from "axios";
import "dotenv/config"

export const callJoinMeeting = async (data, token) => {
  try {
    const response = await axios.post(`${process.env.BASE_URL}/join_meeting/join`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Wrapper Error:", error);
    throw new Error(error.response?.data?.detail || error.message);
  }
};
