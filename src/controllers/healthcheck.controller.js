import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    res
    .status(200)
    .json(new ApiResponse(200, "", "Everything is working Fine."))
})

export {
    healthcheck
    }
    