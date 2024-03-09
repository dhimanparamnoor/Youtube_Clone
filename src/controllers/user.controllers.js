import { asyncHandler } from "../utils/asyncHandler.js";
import {upload} from "../middlewares/multer.middleware.js/"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req,res) =>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullname, email, username,password} = req.body;
    console.log(fullname,email);

    // if(fullname === "")
    // {
    //     throw new ApiError(400, "fullname is required")
    // }

    if(
        [fullname,email,username,password].some((field)=>
            field?.trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required")
    }

    // the above code will check if all the fields are is empty or not 
    // some is return boolean value true or false

    const existedUser = await User.findOne({
       $or: [{email},{username}]
    })

    if(existedUser) {
        throw new ApiError(409, "User with email or username")
    }
    // we can do req.files because user.routes.js in register we set multer middleware there

    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if( !avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // this _id is created by mongoDb that why after created user 
    // we select by _id we store it to createUser so that we cannot send it frontend developer


    if(!createUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createUser,"User Registered Succesfully")
    )

})

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        // generateAccessToken
        console.log(accessToken);
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    // console.log(user);
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    
    // console.log(user._id);
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    // console.log("hiii");
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // it can modify only by server side only you can read it but you cannot modify it.
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refershToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Access")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid Access Token")
    }

    if(incomingRefreshToken !== user?.refershToken){
        throw new ApiError(401, "Refresh Token is expired or used");
    }

    const options = {
        httpOnly:  true,
        secure: true,
    }

    const {accessToken, newrefreshToken} = await generateAccessAndRefereshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
        new ApiResponse(200,{
            accessToken,refreshToken: newrefreshToken,
        },"ACCESS Token Refreshed")
    )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}