import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

// REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
    let { fullName, email, username, password, role } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Clean input data
    email = email.trim().toLowerCase();
    username = username.trim().toLowerCase();

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path || req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const user = await User.create({
        fullName: fullName.trim(),
        avatar: avatar.url,
        email,
        password,
        username,
        role: role && ["student", "instructor"].includes(role) ? role : "student"
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});


// LOGIN USER (Works for BOTH Student and Instructor)
const loginUser = asyncHandler(async (req, res) => {
    let { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    // Clean inputs if provided
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanUsername = username ? username.trim().toLowerCase() : null;

    // Search MongoDB for matching student OR instructor
    const user = await User.findOne({
        $or: [
            cleanUsername ? { username: cleanUsername } : null,
            cleanEmail ? { email: cleanEmail } : null
        ].filter(Boolean)
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});


const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: "watchHistory",
        populate: {
            path: "owner",
            select: "fullName username avatar"
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, user.watchHistory, "Watch history retrieved successfully"));
});

export {
    registerUser,
    loginUser,
    getWatchHistory
};