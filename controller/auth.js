import {User} from "../model/user.js";
import jwt from "jsonwebtoken";
import * as ERROR from "../common/error_message.js";
import { sendSuccess} from "../utils/responseHandler.js";
import argon2  from "argon2"
import {createPipeline} from "./pipeline.controller.js";

import "dotenv/config";

const signIn = async (req, res, next) => {
  const { name, email, password, phoneNumber, role } = req.body;
  

  // console.log(name, email, password);
  try {
    // 🔍 Basic validation
    if (!name) throw new Error(ERROR.NAME);
    if (!email) throw new Error(ERROR.EMAIL);
    if (!password) throw new Error(ERROR.PASSWORD);
    
    // ❗ Check if user already exists
    // console.log(name)
    const userExists = await User.findOne({ email });
    // console.log(userExists)
    // console.log(userExists)
    if (userExists) throw new Error(ERROR.ACCOUNT_ALREADY_EXISTS);

    // 🔐 Hash the password
    const hash = await argon2.hash(password);
    // console.log(hash);

    // 👤 Create user
    const newUser = new User({
      name,
      email,
      password: hash,
      phoneNumber,
      role: role 
    });
    await newUser.save();
    await createPipeline(newUser._id)
    // console.log(newUser);
    // console.log(userExists.name)
    const token = jwt.sign(
      {
        username: newUser.name,
        email: newUser.email,
        userId: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    // console.log(token);

    

    return res.status(201).json({
      message: "User registered  successfully",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isOrganization: newUser.isOrganization,
        _id: newUser._id,
      },
    });
  } catch (err) {
    next(err); // ✅ Send to global error handler
  }
};


const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email,password)
  try {
    if (!email) throw new Error(ERROR.EMAIL);
    if (!password) throw new Error(ERROR.PASSWORD);

    const userExists = await User.findOne({ email });
    console.log(userExists)
    if (!userExists) throw new Error(ERROR.USER_NOT_FOUND);
  if (!userExists.password) {
      throw new Error("You signed up with Google. Please login with Google.");
    }
    const valid = await argon2.verify(userExists.password, password);
    if (!valid) throw new Error(ERROR.INVALID_CREDENTIALS);

    const token = jwt.sign(
      {
        username: userExists.name,
        email: userExists.email,
        userId: userExists._id,
        role: userExists.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    
    return res.status(201).json({
      message:  "Logged in successfully",
      token,
      user: {
        name: userExists.name,
        email:userExists.email,
        role: userExists.role,
        isOrganization: userExists.isOrganization,
        _id: userExists._id,
      },
    });
  } catch (err) {
    next(err); // Let the global error handler catch it
  }
};



const getUserById = async (req, res, next) => {
  try {
    // const user = await User.findById(req.params.id)
    //   .populate("organization") // <-- This line will only work if User schema has organization ref
    //   .select("-password");
    const user = await User.findById(req.params.id)
  .populate("organization") // Optional: if needed
  .select("name email role picture phoneNumber isGoogleUser ");
    if (!user) {
      throw new Error(ERROR.USER_NOT_FOUND);
    }
    const response = {
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      phoneNumber: user.phoneNumber,
      isGoogleUser: user.isGoogleUser,
    };
    return sendSuccess(res, "User fetched successfully",response);
  } catch (err) {
    next(err);
  }
};


const deleteUser=async(req,res,next)=>{
  const userId=req.params.id
     try{
      // console.log(userId)
      const findUser=await User.findById(userId)
      if(!findUser){
        throw new Error(ERROR.USER_NOT_FOUND);
      }
      findUser.isDeleted=true
      await findUser.save()
    
    return sendSuccess(res, "User deleted successfully", findUser);
     }catch(error){
      console.log(error.message)
      next(error)
     }
}
export { signIn, login,getUserById ,deleteUser  };