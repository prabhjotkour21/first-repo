
import { callJoinMeeting } from "../utils/joinWrapper.js";
import * as ERROR from "../common/error_message.js";
import { sendSuccess} from "../utils/responseHandler.js";

export const joinMeetingHandler = async (req, res,next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const {
    gmeet_link,
    duration_in_minutes,
    meetingId,
    userId,
    max_wait_time_in_minutes,
  } = req.body;

  if (!gmeet_link) {
    throw new Error(ERROR.GMAIL_LINK)
  }

  try {
    const result = await callJoinMeeting(
      {
        gmeet_link,
        duration_in_minutes,
        meetingId,
        userId,
        max_wait_time_in_minutes,
      },
      token
    );

    return sendSuccess(res,"Joined successfully", result )
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
