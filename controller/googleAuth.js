

import "dotenv/config";
import {User} from "../model/user.js";
import jwt from "jsonwebtoken";

import * as  ERROR  from "../common/error_message.js";

import {createPipeline} from "./pipeline.controller.js";

import {Pipeline} from "../model/pipeline.model.js";

const googleLogin = async (req, res, next) => {
  try {
    const { name, email, picture, sub: socialId } = req.body;

    if (!email || !socialId) {
      throw new Error(ERROR.GOOGLE_AUTH_MISSING);
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not found
      user = new User({
        name,
        email,
        picture,
        socialId,
        isGoogleUser: true,

      });
      await user.save();
      await createPipeline(user._id)
    }else{
        const pipelineExists = await Pipeline.findOne({ createdBy: user._id });
         if (!pipelineExists) {
        await createPipeline(user._id); 
      }
    }

    // Generate JWT Token
    const token = jwt.sign(
          {
            username: user.name,
            email: user.email,
            userId: user._id,
            role: user.role,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "7d" }
        );

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture,
        organizationId: user.organization,
        role: user.role,
        _id: user._id,
        organization: user.isOrganization
     },
    });
  } catch (error) {
    next(error); // pass error to global error handler
  }
};

export { googleLogin };
