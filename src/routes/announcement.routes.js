import { Router } from "express";
import {
    createAnnouncement,
    getCourseAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
} from "../controllers/announcement.controller.js";
import { verifyJWT, verifyInstructor } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Read announcements for a course
router.route("/course/:courseId").get(getCourseAnnouncements);

// Instructor posting course announcements
router.route("/course/:courseId").post(verifyInstructor, createAnnouncement);

// Manage individual announcements
router.route("/:announcementId")
    .patch(verifyInstructor, updateAnnouncement)
    .delete(verifyInstructor, deleteAnnouncement);

export default router;