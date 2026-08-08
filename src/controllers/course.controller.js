import mongoose, { isValidObjectId } from "mongoose";
import { Course } from "../models/course.model.js";
import { Lesson } from "../models/lesson.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createCourse = asyncHandler(async (req, res) => {
    const { title, description, price, category, level } = req.body;

    if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "Title and description are required");
    }

    const thumbnailLocalPath = req.file?.path;
    let thumbnailUrl = "";

    if (thumbnailLocalPath) {
        const uploaded = await uploadOnCloudinary(thumbnailLocalPath);
        thumbnailUrl = uploaded?.url || "";
    }

    const course = await Course.create({
        title,
        description,
        price: Number(price) || 0,
        category: category || "",
        level: level || "beginner",
        thumbnail: thumbnailUrl,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, course, "Course created successfully"));
});

const getCourseById = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const course = await Course.findById(courseId)
        .populate("owner", "fullName username avatar")
        .populate("lessons");

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, course, "Course fetched successfully"));
});

const updateCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { title, description, price, category, level, isPublished } = req.body;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    if (course.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to edit this course");
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (category) updates.category = category;
    if (level) updates.level = level;
    if (isPublished !== undefined) updates.isPublished = isPublished === "true" || isPublished === true;

    if (req.file?.path) {
        const uploaded = await uploadOnCloudinary(req.file.path);
        if (uploaded) updates.thumbnail = uploaded.url;
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, { $set: updates }, { new: true });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
});

const deleteCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    if (course.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this course");
    }

    await Lesson.deleteMany({ course: courseId });
    await Course.findByIdAndDelete(courseId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Course and attached lessons deleted successfully"));
});

const getInstructorCourses = asyncHandler(async (req, res) => {
    const { instructorId } = req.params;

    if (!isValidObjectId(instructorId)) {
        throw new ApiError(400, "Invalid Instructor ID");
    }

    const courses = await Course.find({ owner: instructorId }).populate("lessons");

    return res
        .status(200)
        .json(new ApiResponse(200, courses, "Instructor courses retrieved"));
});

export {
    createCourse,
    getCourseById,
    updateCourse,
    deleteCourse,
    getInstructorCourses
};