import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middleware.js/";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

async function verifyComment(commentId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment Not Found");
    }
    return comment;
}

const addComment = asyncHandler( async(req, res) => {
    // Add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;

    if (!videoId) {
        throw new ApiError(404, "VideoId is required")
    }

    if (!content) {
        throw new ApiError(404, "content is required")
    }

    const video = await verifyVideo(videoId);

    const comment = await Comment.create({
        content: content,
        video: video._id,
        owner: req.user?._id
    })

    const createdComment = await Comment.findById(comment._id)

    if (!createdComment) {
        throw new ApiError(500, "Something went wrong while creating a comment")
    }

    res
    .status(200)
    .json(new ApiResponse(200, createdComment, "Comment added successfully"))

})


const updateComment = asyncHandler(async (req, res) => {
    // Update a comment
    const {commentId} = req.params
    const {content} = req.body

    if (!commentId) {
        throw new ApiError(404, "commentId is required")
    }

    if (!content) {
        throw new ApiError(404, "content is required")
    }

    await verifyComment(commentId)

    const updateComment = await Comment.findByIdAndUpdate(commentId,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        })

    if (!updateComment) {
        throw new ApiError(500, "Something went wrong while updating comment")
    }

    res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment Updated Successfully."))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!commentId) {
        throw new ApiError(404, "commentId is required")
    }

     await verifyComment(commentId)

     const deleteComment = await Comment.findByIdAndDelete(commentId);

     if (!deleteComment) {
        throw new ApiError(500, "Something went wrong while deleting comment")
    }

    res
    .status(200)
    .json(new ApiResponse(200, {}, "Commnet Deleted Successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }