import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async(userId) => {
   try {
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // Add console.log for debugging
    console.log("Found user:", user._id);

    // Check if methods exist
    if (typeof user.generateAccessToken !== 'function') {
        throw new ApiError(500, "generateAccessToken method not found on user model")
    }
    if (typeof user.generateRefreshToken !== 'function') {
        throw new ApiError(500, "generateRefreshToken method not found on user model")
    }

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    // Add console.log for debugging tokens
    console.log("Tokens generated:", { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken 
    });

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {
         accessToken,
         refreshToken
    }
   } catch (error) {
      console.error("Token generation error:", error);
      throw new ApiError(
          500, 
          "Error generating tokens", 
          [error.message || "Unknown error occurred"]
      )
   }
}

const registerUser = asyncHandler( async (req,res) => {

   const {fullName, email, password,username} = req.body
   if([fullName, email, password,username].some((field) => field?.trim() === ""))
    {
       throw new ApiError("All fields are required", 400)
    }
   const existingUser = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    })
    if (existingUser) {
          throw new ApiError("Email or username already exists", 409)
     }

     const avatarLocalPath = req.files?.avatar[0]?.path;
     let coverImageLocalPath;
     if(req.files?.coverImage)
     {
        coverImageLocalPath = req.files.coverImage[0].path;
     }
     else
     {
        coverImageLocalPath = null;
     }
     
     if(!avatarLocalPath)
     {
        throw new ApiError("Avatar image is required", 400)
     }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar)
    {
        throw new ApiError("Error uploading images", 500)
    }
   const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })
  const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if(!createdUser)
  {
    throw new ApiError("Error creating user", 500)
  }
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User created successfully")
  )

   
})

const loginUser = asyncHandler(async (req,res) => {
   const {email,username, password} = req.body

   if(!username && !email)
   {
      throw new ApiError(400,"Username or Email is required")
   }
   const user = await User.findOne({
      $or: [
         { email },
         { username }
      ]
   })
   if(!user)
   {
      throw new ApiError(404,"Invalid credentials")
   }
   const isPasswordValid = await user.isPasswordMatch(password)
   if(!isPasswordValid)
   {
      throw new ApiError(401,"Invalid credentials")
   }
   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options ={
      httpOnly : true,
      secure : true
   }
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(200,{
         user : loggedInUser,
         accessToken,
         refreshToken
      },"User logged in successfully")
   )






})


const logoutUser = asyncHandler(async (req,res) => {
 await User.findByIdAndUpdate(req.user._id, 
   {
      $set : {
         refreshToken : undefined
      }

   },
   {
      new : true
   }
  )
  const options = {
      httpOnly : true,
      secure : true
   }
   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
      new ApiResponse(200, null, "User logged out successfully")

   )
   

})

const refreshAccessToken = asyncHandler(async (req,res) => 
{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken)
   {
      throw new ApiError(401, "Unauthorized request")
   }
  try {
   const decodedToken = jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET,
 
    )
   const user =  await User.findById(decodedToken?._id)
    if(!user)
    {
          throw new ApiError(401, "Invalid refresh token")
    }
    if(user?.refreshToken !== incomingRefreshToken)
    {
       throw new ApiError(401, "Refresh token is expired or used")
    }
    const options ={
       httpOnly : true,
       secure : true
    }
   const { accessToken, newrefreshToken} =  await generateAccessAndRefreshToken(user._id)
 
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
       new ApiResponse(200, {
          accessToken,
          newrefreshToken
       }, "Access token refreshed successfully")
    )
 
  } catch (error) {
     throw new ApiError(401, error?.message || "Invalid refresh token")
  }


})



export {registerUser, loginUser,logoutUser,refreshAccessToken};