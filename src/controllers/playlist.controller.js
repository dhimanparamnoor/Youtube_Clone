import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middleware.js/";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { verifyVideo } from "./video.controller.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!(name && description))
    {
        throw new ApiError(404, "name and description is required")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id
    })

    const createdPlaylist = await Playlist.findById(playlist._id)

    res
    .status(200)
    .json(new ApiResponse(200, createdPlaylist, "play list created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if (!userId)
    {
        throw new ApiError(404, "User Id is required")
    }

    const verifyUser = await User.findById(userId)

    if(!verifyUser)
    {
        throw new ApiError(404, "User not Found")
    }

    const getPlayList = await Playlist.find({
        owner: userId
    })

    if(!getPlayList){
        throw new ApiError(404, "No Playlist found")
    }

    res
    .status(200)
    .json(new ApiResponse(404, "No Playlist found"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const getPlayList = await Playlist.findById(playlistId)

    if (!getPlayList) {
        throw new ApiError(404, "No Playlist found")
    }

    res
    .status(200)
    .json(new ApiResponse(200, getPlayList, "Successfully fetched Playlist"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!(playlistId && videoId)) {
        throw new ApiError(404, "playList and video Id is required")
    }

    if (!(mongoose.isValidObjectId(playlistId))) {
        throw new ApiError(400, "playlistId is invalid")
    }

    if (!(mongoose.isValidObjectId(videoId))) {
        throw new ApiError(400, "videoId is invalid")
    }

    await verifyVideo(videoId)

    const playList = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet: {
                videos: videoId, // $addToSet is useful for ensuring that elements within an array remain unique.
            }
        },
        {
            new: true, // to return the updated document
        })

    if (!playList) {
        throw new ApiError(404, "play list not found")
    }

    res
    .status(200)
    .json(new ApiResponse(200, playList, "Added video to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!(playlistId && videoId)) {
        throw new ApiError(404, "playList and video Id is required")
    }

    if (!(mongoose.isValidObjectId(playlistId))) {
        throw new ApiError(400, "playlistId is invalid")
    }

    if (!(mongoose.isValidObjectId(videoId))) {
        throw new ApiError(400, "videoId is invalid")
    }

    await verifyVideo(videoId)

    const playList = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull: {
                videos: videoId, // Pulls items from the array atomically. 
            }
        },
        {
            new: true, // to return the updated document
        })

    if (!playList) {
        throw new ApiError(404, "play list not found")
    }

    res
    .status(200)
    .json(new ApiResponse(200, playList, "Removed video to playlist"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const playList = await Playlist.findByIdAndDelete(playlistId)

    if (!playList) {
        throw new ApiError(404, "Playlist not found")
    }

    res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully deleted Playlist"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!(name && description)) {
        throw new ApiError(404, "name and description is required")
    }

    const playList = await Playlist.findByIdAndUpdate(playlistId, {
        $set: {
            name: name,
            description: description
        }
    },
    {
        new: true,
    })

    if (!playList) {
        throw new ApiError(404, "Playlist not found")
    }

    res
    .status(200)
    .json(new ApiResponse(200, playList, "Successfully Updated Playlist"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}