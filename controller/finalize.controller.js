
import fs from "fs";
import path from "path";
import { callFastAPIFinalize } from "../utils/finalizeWrapper.js";

export const finalizeSessionHandler = async (req, res) => {
  const file = req.file;
  const { meetingId, eventId } = req.body;

  if (!file || !meetingId || !eventId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await callFastAPIFinalize({
      filePath: file.path,
      meetingId,
      eventId,
    });

    fs.unlinkSync(file.path); // Delete temp uploaded file
    return res.status(200).json({ message: "Success", result });
  } catch (error) {
    fs.unlinkSync(file.path);
    console.log(error.message )
    return res.status(500).json({ error: error.message });
  }
};
