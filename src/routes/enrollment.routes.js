import { Router } from "express";
import {
    enrollInCourse,
    unenrollFromCourse,
    markLessonCompleted,
    getStudentCourses,
    getCourseStudents
} from "../controllers/enrollment.controller.js";
import { verifyJWT, verifyInstructor } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Student enrollments
router.route("/c/:courseId").post(enrollInCourse).delete(unenrollFromCourse);
router.route("/c/:courseId/lesson/:lessonId/complete").patch(markLessonCompleted);
router.route("/student/my-courses").get(getStudentCourses);

// Instructor route to view course roster
router.route("/c/:courseId/students").get(verifyInstructor, getCourseStudents);

export default router;