import { Router } from "express";
import {
    getAllCourseLessons,
    createLesson,
    getLessonById,
    updateLesson,
    deleteLesson,
    togglePublishStatus
} from "../controllers/lesson.controller.js";
import { verifyJWT, verifyInstructor } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

// Get lessons for a course
router.route("/course/:courseId").get(getAllCourseLessons);

// Instructor routes to add lessons to a course
router.route("/course/:courseId").post(
    verifyInstructor,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    createLesson
);

// Lesson specific routes
router.route("/:lessonId")
    .get(getLessonById)
    .patch(verifyInstructor, upload.single("thumbnail"), updateLesson)
    .delete(verifyInstructor, deleteLesson);

router.route("/toggle/publish/:lessonId").patch(verifyInstructor, togglePublishStatus);

export default router;