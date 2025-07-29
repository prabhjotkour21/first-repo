import base64url from "base64url";

import { Email } from "../model/email.model.js";
import { User } from "../model/user.js";

import { getValidOAuthClient } from "./tokenHandler.js";
import * as ERROR from "../common/error_message.js";
import { sendSuccess } from "../utils/responseHandler.js";


import {ClientCompany} from "../model/clientCompany.model.js"

import {Organization} from "../model/organization.js"

import {Deal} from "../model/deal.model.js"



// Send Draft Mail

export const createDraft = async (req, res,next) => {
  const { to, subject, message, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if(!user){
      throw new Error(ERROR.USER_NOT_FOUND);
    }
    if (!user.tokens.gmail?.refresh_token) {
       throw new Error(ERROR.TOKEN_NOT_FOUND);
    }

    //  Step 1: Get valid OAuth2 client
    const oauth2Client = await getValidOAuthClient(user, "gmail");

    //  Step 2: Create Gmail client using the OAuth2 client
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const rawMessage = base64url.encode(
      `To: ${to}\nSubject: ${subject}\n\n${message}`
    );

    //  Step 3: Create draft
    const draft = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: rawMessage,
        },
      },
    });

    // res.status(200).json({ message: "Draft created", id: draft.data.id });
    return sendSuccess(res, "Draft created successfully", {
      draftId: draft.data.id,
      to,
      subject,
    });
  } catch (err) {
    console.error(" Draft creation error:", err);
    next(err)
  }
};
// Send Mail
export const sendEmail = async (req, res,next) => {
  const { to, subject, message, email } = req.body;
  const user = await User.findOne({ email });

  try {
  
    if (!user) {
      throw new Error(ERROR.USER_NOT_FOUND);
    }

    if (!user.tokens.gmail?.refresh_token) {
      console.error("❌ Gmail token missing for user:", user.email);
       throw new Error(ERROR.TOKEN_NOT_FOUND);
    }

    const oauth2Client = await getValidOAuthClient(user, "gmail");
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

     const encodedMessage = Buffer.from(
      `To: ${to}\r\n` +
      `Subject: ${subject}\r\n\r\n` +
      `${message}`
    ).toString("base64").replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const sendRes = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    // res.status(200).json({
    //   message: "Email sent",
    //   id: sendRes.data.id,
    //   threadId: sendRes.data.threadId,
    // });
     return sendSuccess(res, "Email sent successfully", {
      id: sendRes.data.id,
      threadId: sendRes.data.threadId,
      to,
      subject,
    });
  } catch (error) {
    console.error("❌ Email send error:", err);
    next(error);
  }
};


// Read Emails
export const getSyncedEmails = async (req, res,next) => {
  const { label = "INBOX", page = 1, limit = 10, search = "" } = req.query;
// const { userEmail } = req.params;
  const filter = {
    // userEmail: userEmail?.trim().toLowerCase(),
    label: label.toUpperCase(),
    $or: [
      { subject: { $regex: search, $options: "i" } },
      { from: { $regex: search, $options: "i" } },
      { snippet: { $regex: search, $options: "i" } },
    ],
  };

  try {
    const skip = (page - 1) * limit;
    const total = await Email.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    const emails = await Email.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));
    return sendSuccess(res,"Emails fetched successfully", {
          total,
          page: Number(page),
          pages,
          hasMore: Number(page) < pages,
          nextPageNumber: Number(page) < pages ? Number(page) + 1 : null,
          prevPageNumber: Number(page) > 1 ? Number(page) - 1 : null,
          emails,
    });
  } catch (error) {
    console.log("Failed to fetch emails",error.message)
    next(error)
  }
};

// Read Email for Specific email

export const getSyncedEmailsForSpecific = async (req, res, next) => {
  const { label = "INBOX", page = 1, limit = 10, search = "" } = req.query;
const { userEmail } = req.params;
  const filter = {
    userEmail: userEmail?.trim().toLowerCase(),
    label: label.toUpperCase(), 
    $or: [
      { subject: { $regex: search, $options: "i" } },
      { from: { $regex: search, $options: "i" } },
      { snippet: { $regex: search, $options: "i" } },
    ],
  };

   console.log(filter)
  try {
    const skip = (page - 1) * limit;
    const total = await Email.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    const emails = await Email.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

     return sendSuccess(res, "Emails fetched successfully for Specific User", {
        total,
        page: Number(page),
        pages,
        hasMore: Number(page) < pages,
        nextPageNumber: Number(page) < pages ? Number(page) + 1 : null,
        prevPageNumber: Number(page) > 1 ? Number(page) - 1 : null,
        emails,
    });
  } catch (error) {
    next(error);
  }
};

// Read Emails of manger or teamMember

export const readTeamInboxFromDB = async (req, res, next) => {
  try {
    const managerId = req.user.userId;

    //  Step 1: Get all team members (manager + invited users)
    const allMembers = await User.find({
      $or: [
        { _id: managerId },         // manager himself
        { inviteBy: managerId }     // invited members
      ]
    });

    if (!allMembers.length) {
      throw new Error(ERROR.TeamMembers);
    }

    const results = [];

    for (const member of allMembers) {
      try {
        const emails = await Email.find({ userEmail: member.email })
          .sort({ date: -1 })
          .limit(10);  

        results.push({
          email: member.email,
          messages: emails.map(email => ({
            subject: email.subject,
            from: email.from,
            date: email.date,
            snippet: email.snippet,
            label: email.label
          }))
        });

      } catch (err) {
        console.error(` DB fetch failed for ${member.email}:`, err.message);
        results.push({
          email: member.email,
          error: "Failed to fetch emails from DB"
        });
      }
    }

    return sendSuccess(res, "Team inbox fetched from DB successfully", { results });

  } catch (error) {
    console.error("Read Team Inbox from DB Error:", error.message);
    next(error);
  }
};


export const searchEmailForPrompt=async(req,res,next)=>{
  try{
    const {search,userEmail}=req.query
    const regex=new RegExp(search,"i")
    const emails=await Email.find({
       $and: [
    {userEmail },
    {
      $or: [
        { subject: regex },
        { snippet: regex }
      ]
    }
  ]
    })
    return sendSuccess(res,"Email fetch Successfully",{ data: emails }) 

  }catch(error){
    console.log("Error in fetch email for prompt",error.message)
    next(error)
  }
  
}



// export const getClientEmailConversationsByDeal = async (req, res, next) => {
//   try {
//     const { dealId } = req.params;
//     const { page = 1, limit = 10, search = "" } = req.query;

//     // Step 1: Get Deal with client companies
//     const deal = await Deal.findById(dealId).populate("clientCompanyIds");
//     // if (!deal || deal.clientCompanyIds.length === 0) {
//     //   return res.status(404).json({ message: "Deal or client companies not found" });
//     // }

//     console.log(deal)

//     // Step 2: Extract emails from all client companies
//     const clientEmails = deal.clientCompanyIds
//       .map(company => company.email?.toLowerCase())
//       .filter(email => !!email); // filter out undefined/null

//     if (clientEmails.length === 0) {
//       return res.status(400).json({ message: "No client emails found in the deal" });
//     }

//     // Step 3: Search filter for matching emails
//     const filter = {
//       $or: [
//         { from: { $in: clientEmails } },
//         { to: { $in: clientEmails } },
//       ],
//       $or: [
//         { subject: { $regex: search, $options: "i" } },
//         { snippet: { $regex: search, $options: "i" } }
//       ]
//     };

//     // Step 4: Pagination + Fetch
//     const skip = (page - 1) * limit;
//     const total = await Email.countDocuments(filter);
//     const pages = Math.ceil(total / limit);

//     const emails = await Email.find(filter)
//       .sort({ date: -1 })
//       .skip(skip)
//       .limit(Number(limit));

//     return res.status(200).json({
//       message: " Client-related emails fetched successfully",
//       total,
//       page: Number(page),
//       pages,
//       hasMore: Number(page) < pages,
//       emails
//     });

//   } catch (error) {
//     console.error(" Error in fetching client emails:", error);
//     next(error);
//   }
// };
