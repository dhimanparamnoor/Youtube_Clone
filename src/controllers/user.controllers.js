import { asyncHandler } from "../utils/asyncHandler.js";
import {upload} from "../middlewares/multer.middleware.js/"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/Apiresponse.js";

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

export {registerUser}