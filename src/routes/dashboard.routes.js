import { Router } from "express";
import {
    getInstructorStats,
    getInstructorCourses
} from "../controllers/dashboard.controller.js";
import { verifyJWT, verifyInstructor } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, verifyInstructor);

router.route("/stats").get(getInstructorStats);
router.route("/courses").get(getInstructorCourses);

export default router;