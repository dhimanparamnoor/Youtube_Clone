import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;

    if(!content){
        throw new ApiError(404, "content is required");
    }

    const createtweet = await Tweet.create({
        content: content,
        owner: req.user._id,
    })

    const tweet = await Tweet.findById(createtweet._id)

    if(!tweet){
        throw new ApiError(500, "Something went wrong while creating a tweet")
    }

    res
    .status(200)
    .json(new ApiResponse(200, tweet,"Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;

    if(!userId){
        throw new ApiError(404,"userId is required");
    }
    console.log(req.user);
    const tweets = await Tweet.find({
        owner: req.user._id
    }).select("-owner")

    if(!tweets){
        throw new ApiError(500, "Something went wrong while getting tweets")
    }

    res
    .status(200)
    .json(new ApiResponse(200, tweets, `Got tweets Successfully for UserID: ${userId}`))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {tweetId} = req.params;
    const {content} = req.body;
    if(!tweetId){
        throw new ApiError(404, "tweet is required");
    }

    if(!content){
        throw new ApiError(404, "content is required");
    }

    const updatedtweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
              content  
            }
        },
        {new :true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updatedtweet, "Tweet updated Successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params;

    if(!tweetId){
        throw new ApiError(404, "tweet is required");
    }

    const tweets = await Tweet.findByIdAndDelete(tweetId)

    if (!tweets) {
        throw new ApiError(404, "tweet id not found.")
    }

    res
    .status(200)
    .json(new ApiResponse(200, {}, `Deleted the tweet successfully for tweetId: ${tweetId}`))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}