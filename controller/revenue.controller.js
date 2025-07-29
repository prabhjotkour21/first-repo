import { callRevenueAPI } from "../utils/revenue.js";
import { sendSuccess } from "../utils/responseHandler.js";

import {User} from "../model/user.js"

export const getRevenueSummary = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    // console.log(user)
    
   const findOrg=await User.findById(userId).select("organization")
   const orgId=findOrg.organization?.toString()
//    console.log(orgId)

    const token = req.headers.authorization?.split(" ")[1];
    // console.log(token)

    // Call the FastAPI revenue summary API
    const result = await callRevenueAPI(orgId, token);

    return sendSuccess(res, "Revenue summary fetched", result);
  } catch (error) {
    console.log("Revenue API failed", error.message);
    next(error);
  }
};
