
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
    const token =  req.cookies?.accessToken || req.header
     ("Authorization")?.replace("Bearer ", "")
     if(!token)
     {
         throw new ApiError(401, "You are not authorized to access this resource")
     }
    const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) 
     if(!decodedToken)
     {
         throw new ApiError(401, "You are not authorized to access this resource")
     }
    const user =  await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user)
    {
     throw new ApiError(401, "You are not authorized to access this resource")
    }
    req.user = user;
     next()
 
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token")
    
   }


})