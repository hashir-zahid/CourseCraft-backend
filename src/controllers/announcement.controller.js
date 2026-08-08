import mongoose, { isValidObjectId } from "mongoose";
import { Announcement } from "../models/announcement.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createAnnouncement = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Announcement content is required");
    }

    const announcement = await Announcement.create({
        content,
        course: courseId,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, announcement, "Announcement created successfully"));
});

const getCourseAnnouncements = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid Course ID");
    }

    const announcements = await Announcement.find({ course: courseId })
        .populate("owner", "fullName username avatar")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, announcements, "Course announcements retrieved"));
});

const updateAnnouncement = asyncHandler(async (req, res) => {
    const { announcementId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(announcementId)) {
        throw new ApiError(400, "Invalid Announcement ID");
    }

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
        throw new ApiError(404, "Announcement not found");
    }

    if (announcement.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized action");
    }

    announcement.content = content || announcement.content;
    await announcement.save();

    return res
        .status(200)
        .json(new ApiResponse(200, announcement, "Announcement updated successfully"));
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
    const { announcementId } = req.params;

    if (!isValidObjectId(announcementId)) {
        throw new ApiError(400, "Invalid Announcement ID");
    }

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
        throw new ApiError(404, "Announcement not found");
    }

    if (announcement.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized action");
    }

    await Announcement.findByIdAndDelete(announcementId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Announcement deleted successfully"));
});

export {
    createAnnouncement,
    getCourseAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
};