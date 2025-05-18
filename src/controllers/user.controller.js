import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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





export {registerUser};