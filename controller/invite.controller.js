import { User } from "../model/user.js";
import * as ERROR from "../common/error_message.js";
import { sendSuccess } from "../utils/responseHandler.js";

// Placeholder for email sending
const sendInviteEmail = async (email, password) => {
  console.log('email: ', email);
  console.log('password: ', password);
  // TODO: Implement email sending logic
};

const randomPassword = () => {
  var chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var passwordLength = 12;
  var password = "";

  for (var i = 0; i <= passwordLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
};

const inviteUsers = async (req, res, next) => {
  try {
    const { emails, role, organization } = req.body;
    const inviteBy = req.user.userId;

    if (!emails || !Array.isArray(emails) || emails.length === 0)
      throw new Error(ERROR.EMAIL);
    if (!role) throw new Error(ERROR.ROLE);
    if (!organization) throw new Error(ERROR.ORGANISATION);

    const results = [];
    for (const email of emails) {
      // Check if user already exists
      const existing = await User.findOne({ email });
      if (existing) {
        results.push({ email, status: "already_exists" });
        continue;
      }
      const password = randomPassword();
      const user = new User({
        email,
        password,
        role,
        organization,
        inviteBy,
        isValidated: false,
        emailVerified: false,
      });
      await user.save();
      await sendInviteEmail(email, password); // Placeholder
      results.push({ email, status: "invited" });
    }
    return sendSuccess(res, "Invites processed", { results });
  } catch (err) {
    next(err);
  }
};

export { inviteUsers };
