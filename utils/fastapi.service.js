import axios from "axios";

const BASE_URL = "http://192.168.1.15:8000";

// Sync calendar events from FastAPI
export async function syncCalendar(token) {
  try {
    const response = await axios.post("http://192.168.1.15:8000/api/calendar/sync", null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error syncing calendar:", error.response?.data || error.message);
    throw error;
  }
}
