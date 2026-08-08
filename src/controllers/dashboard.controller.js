import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { Lesson } from "../models/lesson.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Rating } from "../models/rating.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getInstructorStats = asyncHandler(async (req, res) => {
    const instructorId = req.user._id;

    // 1. Get total courses owned by instructor
    const courses = await Course.find({ owner: instructorId });
    const courseIds = courses.map((course) => course._id);

    if (courseIds.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, {
                totalCourses: 0,
                totalLessons: 0,
                totalStudents: 0,
                totalViews: 0,
                averageRating: 0
            }, "Instructor has no courses yet")
        );
    }

    // 2. Aggregate total lesson views and total lessons
    const lessonStats = await Lesson.aggregate([
        {
            $match: {
                course: { $in: courseIds }
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalLessons: { $sum: 1 }
            }
        }
    ]);

    // 3. Aggregate total unique enrollments/students
    const totalStudents = await Enrollment.countDocuments({
        course: { $in: courseIds }
    });

    // 4. Aggregate average course rating
    const ratingStats = await Rating.aggregate([
        {
            $match: {
                course: { $in: courseIds }
            }
        },
        {
            $group: {
                _id: null,
                avgRating: { $avg: "$stars" }
            }
        }
    ]);

    const stats = {
        totalCourses: courses.length,
        totalLessons: lessonStats[0]?.totalLessons || 0,
        totalStudents: totalStudents || 0,
        totalViews: lessonStats[0]?.totalViews || 0,
        averageRating: ratingStats[0]?.avgRating ? Number(ratingStats[0].avgRating.toFixed(1)) : 0
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Instructor stats fetched successfully"));
});

const getInstructorCourses = asyncHandler(async (req, res) => {
    const instructorId = req.user._id;

    const courses = await Course.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(instructorId)
            }
        },
        {
            $lookup: {
                from: "lessons",
                localField: "_id",
                foreignField: "course",
                as: "lessons"
            }
        },
        {
            $lookup: {
                from: "enrollments",
                localField: "_id",
                foreignField: "course",
                as: "enrollments"
            }
        },
        {
            $addFields: {
                totalLessons: { $size: "$lessons" },
                totalStudents: { $size: "$enrollments" }
            }
        },
        {
            $project: {
                lessons: 0,
                enrollments: 0
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, courses, "Instructor courses fetched successfully"));
});

export {
    getInstructorStats,
    getInstructorCourses
};