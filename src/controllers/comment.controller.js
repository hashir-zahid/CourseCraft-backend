import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getLessonComments = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(lessonId)) {
        throw new ApiError(400, "Invalid Lesson ID");
    }

    const aggregateQuery = Comment.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(lessonId) } },
        { $sort: { createdAt: -1 } }
    ]);

    const comments = await Comment.aggregatePaginate(aggregateQuery, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Lesson comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(lessonId)) {
        throw new ApiError(400, "Invalid Lesson ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const comment = await Comment.create({
        content,
        video: lessonId, // schema keeps video property pointing to Lesson
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to edit comment");
    }

    comment.content = content || comment.content;
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
    getLessonComments,
    addComment,
    updateComment,
    deleteComment
};