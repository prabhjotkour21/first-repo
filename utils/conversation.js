import axios from "axios";
import "dotenv/config";

export const fetchConversationInsight = async (organizationId, token) => {
  try {
    const response = await axios.get(
      `${process.env.BASE_URL}/sg/conversation-insights/${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch conversation insights:", error.message);
    throw error;
  }
};
