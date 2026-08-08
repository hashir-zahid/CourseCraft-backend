import { Router } from "express";
import {
    getLessonComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Q&A Comments per lesson
router.route("/lesson/:lessonId").get(getLessonComments);

// Authenticated user commenting logic
router.use(verifyJWT);
router.route("/lesson/:lessonId").post(addComment);
router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;