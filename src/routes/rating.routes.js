import { Router } from "express";
import {
    addOrUpdateRating,
    deleteRating,
    getCourseRatings
} from "../controllers/rating.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public course reviews view
router.route("/c/:courseId").get(getCourseRatings);

// Protected rating actions
router.use(verifyJWT);
router.route("/c/:courseId")
    .post(addOrUpdateRating)
    .delete(deleteRating);

export default router;