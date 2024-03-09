import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        // req.cookies?.accessToken because in app.js we use middleware cookie.parser() there
    
        if (!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("decode_Token",decodeToken);
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken") // this _id comes from generateTokenaccess in user.model.js
    
        if(!user){
            throw new ApiError(401,"Invaild Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message|| "Invaild access token")
    }
})