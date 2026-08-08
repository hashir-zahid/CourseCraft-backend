import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// Middleware to authorize specific roles (e.g., "instructor", "admin")
export const verifyRole = (...allowedRoles) => {
    return (req, _, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}`
            );
        }
        next();
    };
};

// Convenient shorthand specifically for instructor-only routes
export const verifyInstructor = verifyRole("instructor");