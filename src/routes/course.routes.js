import { Router } from "express";
import {
    createCourse,
    getCourseById,
    updateCourse,
    deleteCourse,
    getInstructorCourses
} from "../controllers/course.controller.js";
import { verifyJWT, verifyInstructor } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public course details lookup
router.route("/c/:courseId").get(getCourseById);
router.route("/instructor/:instructorId").get(getInstructorCourses);

// Instructor-only route to create courses
router.route("/").post(
    verifyJWT,
    verifyInstructor,
    upload.single("thumbnail"),
    createCourse
);

// Instructor-only updates & deletion
router.route("/:courseId")
    .patch(verifyJWT, verifyInstructor, upload.single("thumbnail"), updateCourse)
    .delete(verifyJWT, verifyInstructor, deleteCourse);

export default router;