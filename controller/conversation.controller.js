import { fetchConversationInsight } from "../utils/conversation.js";
import * as ERROR from "../common/error_message.js";
import { sendSuccess } from "../utils/responseHandler.js";
import {User} from "../model/user.js"
export const getConversationInsightHandler = async (req, res, next) => {
  try {

    const userId= req.user.userId
    console.log(userId)
    
        
    const findOrg=await User.findById(userId).select("organization")
    const orgId=findOrg.organization?.toString()

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error(ERROR.TOKEN_NOT_FOUND);
    }

    const insight = await fetchConversationInsight(orgId, token);
    return sendSuccess(res, "Conversation Insights fetched successfully", insight);
  } catch (error) {
    console.error("Error in conversation insight:", error.message);
    next(error);
  }
};
