import mongoose, { isValidObjectId } from "mongoose";
import { Lesson } from "../models/lesson.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllCourseLessons = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { page = 1, limit = 10, query, sortBy = "order", sortType = "asc" } = req.query;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const filter = { course: new mongoose.Types.ObjectId(courseId) };
    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    const aggregateQuery = Lesson.aggregate([
        { $match: filter },
        { $sort: sortOptions }
    ]);

    const lessons = await Lesson.aggregatePaginate(aggregateQuery, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    });

    return res
        .status(200)
        .json(new ApiResponse(200, lessons, "Lessons fetched successfully"));
});

const createLesson = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { title, description, order, isPreview } = req.body;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    if ([title, description, order].some((field) => field === undefined || field?.trim?.() === "")) {
        throw new ApiError(400, "Title, description, and order are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Lesson video file is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = thumbnailLocalPath ? await uploadOnCloudinary(thumbnailLocalPath) : null;

    if (!videoFile) {
        throw new ApiError(400, "Error uploading video file to Cloudinary");
    }

    const lesson = await Lesson.create({
        title,
        description,
        duration: videoFile.duration || 0,
        videoFile: videoFile.url,
        thumbnail: thumbnail?.url || "",
        course: courseId,
        order: Number(order),
        isPreview: isPreview === "true" || isPreview === true,
        owner: req.user._id
    });

    // Automatically push lesson reference into course array
    await Course.findByIdAndUpdate(courseId, {
        $push: { lessons: lesson._id }
    });

    return res
        .status(201)
        .json(new ApiResponse(201, lesson, "Lesson created successfully"));
});

const getLessonById = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;

    if (!isValidObjectId(lessonId)) {
        throw new ApiError(400, "Invalid Lesson ID");
    }

    const lesson = await Lesson.findById(lessonId).populate("owner", "fullName username avatar");

    if (!lesson) {
        throw new ApiError(404, "Lesson not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, lesson, "Lesson retrieved successfully"));
});

const updateLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { title, description, order, isPreview } = req.body;

    if (!isValidObjectId(lessonId)) {
        throw new ApiError(400, "Invalid Lesson ID");
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
        throw new ApiError(404, "Lesson not found");
    }

    if (lesson.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to edit this lesson");
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (order !== undefined) updates.order = Number(order);
    if (isPreview !== undefined) updates.isPreview = isPreview === "true" || isPreview === true;

    if (req.file?.path) {
        const thumbnail = await uploadOnCloudinary(req.file.path);
        if (thumbnail) updates.thumbnail = thumbnail.url;
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, { $set: updates }, { new: true });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedLesson, "Lesson updated successfully"));
});

const deleteLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;

    if (!isValidObjectId(lessonId)) {
        throw new ApiError(400, "Invalid Lesson ID");
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
        throw new ApiError(404, "Lesson not found");
    }

    if (lesson.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this lesson");
    }

    await Lesson.findByIdAndDelete(lessonId);

    // Remove from associated course
    await Course.findByIdAndUpdate(lesson.course, {
        $pull: { lessons: lessonId }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Lesson deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;

    if (!isValidObjectId(lessonId)) {
        throw new ApiError(400, "Invalid Lesson ID");
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
        throw new ApiError(404, "Lesson not found");
    }

    if (lesson.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized operation");
    }

    lesson.isPublished = !lesson.isPublished;
    await lesson.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, lesson, "Lesson publish status updated"));
});

export {
    getAllCourseLessons,
    createLesson,
    getLessonById,
    updateLesson,
    deleteLesson,
    togglePublishStatus
};