import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middleware.js/";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!(title && description)){
        throw new ApiError(404, "Titleand description is required")
    }

    const videoLocalPath = req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0 ? req.files.videoFile[0]?.path: null;
    const thumbnailPath = req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0 ? req.files.thumbnail[0]?.path: null; 

    console.log(req.files);

    if(!(videoLocalPath && thumbnailPath)){
        throw new ApiError(404, "VideoFile and Thumbnail is required")
    }
    
    const video =await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    console.log("video",video);

    const user = await User.findById(req.user?._id)
    
    if(!user) {
        throw new ApiError(404,"User not found")
    }    

    const publishVideo = await Video.create({
        videoFile: video?.url,
        thumbnail: thumbnail?.url,
        title: title,
        description: description,
        duration: video?.duration,
        views: 0,
        isPublished: true,
        owner: req.user?._id
    })

    const createdVideo = await Video.findById(publishVideo._id)

    if(!createdVideo){
        throw new ApiError(500,"something went wrong while publishing the video")
    }

    res
    .status(200)
    .json(new ApiResponse(200, createdVideo,"video Published Successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(404, "Video Id is required")
    }

    const video = await Video.findById(videoId);

    video.views += 1;

    await video.save();

    res
    .status(200)
    .response(new ApiResponse(200, video,"Video details fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;

    const thumbnailPath = req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0?req.files.thumbnail[0]?.path : null 

    if (!(thumbnailPath && title && description)){
        throw new ApiError(404, "thumbnail, title, description is required")
    }

    if (!videoId) {
        throw new ApiError(404, "Video Id is required")
    }

    const video = await verifyVideo(videoId);

    await deleteOnCloudinary(video?.thumbnail, "image")

    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    const updateVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                title: title,
                description: description
            }
        },
        {
                new: true
            })

    res.
    status(200)
    .json(new ApiResponse(200, updateVideo, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(404, "Video Id is required")
    }

    const video = await verifyVideo(videoId);

    await deleteOnCloudinary(video?.videoFile, "video")
    await deleteOnCloudinary(video?.thumbnail, "image")

    const deleteVideo = await Video.findByIdAndDelete(videoId)

    if (!deleteVideo){
        throw new ApiError(500, "Something went wrong while deleteing video by id")
    }

    res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted Successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}