import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const healthcheck = asyncHandler(async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    const healthInfo = {
        status: "OK",
        message: "Server is healthy and running smoothly",
        database: dbStatus,
        uptime: `${Math.floor(process.uptime())} seconds`,
        timestamp: new Date().toISOString()
    };

    return res
        .status(200)
        .json(new ApiResponse(200, healthInfo, "Health check successful"));
});

export {
    healthcheck
};