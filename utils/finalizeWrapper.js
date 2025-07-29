
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import "dotenv/config"

export const callFastAPIFinalize = async ({ filePath, meetingId, eventId }) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("meetingId", meetingId);
    form.append("eventId", eventId);

    const response = await axios.post(`${process.env.BASE_URL}/meeting/finalize-offline-session`, form, {
      headers: form.getHeaders(),
    });

    return response.data;
  } catch (err) {
     console.error("❌ Wrapper Error:", err); 
    throw new Error(err.response?.data?.detail || err.message);
  }
};
