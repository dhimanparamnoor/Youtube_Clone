import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import mongoose, {isValidObjectId} from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!mongoose.isValidObjectId(videoId))
    {
        throw new ApiError(400, "Invaild video Id");
    }

    const video = await Video.findById(videoId);

    if(!video)
    {
        throw new ApiError(404, "video not found")
    }

    const videoLike = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })
    if(!videoLike) {
        throw new ApiError(500, "Something went wrong while liking the video")
    }
    res
    .status(200)
    .json(new ApiResponse(200, videoLike, `Liked the videoId: ${videoId}`))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment id");
    }

    const comment = await Comment.findById(commentId);

    if(!comment)
    {
        throw new ApiError(404, "Comment not found");
    }

    const commentLike = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    if(!commentLike) {
        throw new ApiError(500, "Something went wrong while liking the comment")
    }

    res
    .status(200)
    .json(new ApiResponse(200, commentLike, `Liked the videoID: ${commentId}`))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!mongoose.isValidObjectId(tweetId))
    {
        throw new ApiError(400, "Invaild tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet)
    {
        throw new ApiError(404, "tweet not found")
    }

    const tweetLike = await Like.create({
        tweet :tweetId,
        likedBy: req.user?._id
    })

    if( !tweetLike) {
        throw new ApiError(500, "Something went wrong while liking the tweet");
    }

    res
    .status(200)
    .json(new ApiResponse(200, tweetLike,`Liked the videoID: ${tweetId}`))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //Get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoData",
                pipeline: [
                            {
                                $project: {
                                    thumbnail: 1,
                                    title: 1,
                                    description: 1,
                                    owner: 1,
                                    duration: 1,
                                    views: 1,
                                    createdAt: 1,
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: "$videoData"
                },
                {
                    $replaceRoot: {
                        newRoot: "$videoData"
                    }
                }
            ]);
            
    if (!likedVideos?.length) {
            throw new ApiError(404, "liked Videos not found")
        }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            likedVideosCount: likedVideos.length,
            likedVideos: likedVideos},
            "liked Videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}