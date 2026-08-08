import mongoose, { isValidObjectId } from "mongoose";
import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const enrollInCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const existingEnrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId
    });

    if (existingEnrollment) {
        throw new ApiError(400, "Already enrolled in this course");
    }

    const enrollment = await Enrollment.create({
        student: req.user._id,
        course: courseId,
        completedLessons: [],
        progress: 0
    });

    return res
        .status(201)
        .json(new ApiResponse(201, enrollment, "Successfully enrolled in course"));
});

const unenrollFromCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const deleted = await Enrollment.findOneAndDelete({
        student: req.user._id,
        course: courseId
    });

    if (!deleted) {
        throw new ApiError(404, "Enrollment record not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unenrolled successfully"));
});

const markLessonCompleted = asyncHandler(async (req, res) => {
    const { courseId, lessonId } = req.params;

    if (!isValidObjectId(courseId) || !isValidObjectId(lessonId)) {
        throw new ApiError(400, "Invalid Course or Lesson ID");
    }

    const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId
    });

    if (!enrollment) {
        throw new ApiError(404, "You are not enrolled in this course");
    }

    const course = await Course.findById(courseId);
    const totalLessons = course?.lessons?.length || 1;

    if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
    }

    enrollment.progress = Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100));
    await enrollment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, enrollment, "Lesson status updated successfully"));
});

const getStudentCourses = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.user._id })
        .populate({
            path: "course",
            populate: { path: "owner", select: "fullName username avatar" }
        });

    return res
        .status(200)
        .json(new ApiResponse(200, enrollments, "Enrolled courses retrieved"));
});

const getCourseStudents = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const students = await Enrollment.find({ course: courseId }).populate("student", "fullName username avatar email");

    return res
        .status(200)
        .json(new ApiResponse(200, students, "Course students retrieved"));
});

export {
    enrollInCourse,
    unenrollFromCourse,
    markLessonCompleted,
    getStudentCourses,
    getCourseStudents
};