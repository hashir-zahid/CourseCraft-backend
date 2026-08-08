import mongoose, { isValidObjectId } from "mongoose";
import { Rating } from "../models/rating.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addOrUpdateRating = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { stars, review } = req.body;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    if (!stars || stars < 1 || stars > 5) {
        throw new ApiError(400, "Star rating must be between 1 and 5");
    }

    const existingRating = await Rating.findOne({
        course: courseId,
        likedBy: req.user._id
    });

    if (existingRating) {
        existingRating.stars = stars;
        if (review !== undefined) existingRating.review = review;
        await existingRating.save();

        return res
            .status(200)
            .json(new ApiResponse(200, existingRating, "Course review updated"));
    }

    const rating = await Rating.create({
        course: courseId,
        likedBy: req.user._id,
        stars,
        review: review || ""
    });

    return res
        .status(201)
        .json(new ApiResponse(201, rating, "Course rated successfully"));
});

const deleteRating = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const deleted = await Rating.findOneAndDelete({
        course: courseId,
        likedBy: req.user._id
    });

    if (!deleted) {
        throw new ApiError(404, "Rating not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Rating removed successfully"));
});

const getCourseRatings = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const ratings = await Rating.find({ course: courseId }).populate("likedBy", "fullName username avatar");

    const stats = await Rating.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        { $group: { _id: "$course", averageStars: { $avg: "$stars" }, totalRatings: { $sum: 1 } } }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, { ratings, summary: stats[0] || { averageStars: 0, totalRatings: 0 } }, "Ratings fetched successfully"));
});

export {
    addOrUpdateRating,
    deleteRating,
    getCourseRatings
};