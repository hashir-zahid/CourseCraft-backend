import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: function (origin, callback) {
            return callback(null, true);
        }, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRouter from "./routes/user.routes.js";
import courseRouter from "./routes/course.routes.js";
import lessonRouter from "./routes/lesson.routes.js";
import enrollmentRouter from "./routes/enrollment.routes.js";
import ratingRouter from "./routes/rating.routes.js";
import announcementRouter from "./routes/announcement.routes.js";
import commentRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

// Mount routes
app.use("/users", userRouter);
app.use("/courses", courseRouter);
app.use("/lessons", lessonRouter);
app.use("/enrollments", enrollmentRouter);
app.use("/ratings", ratingRouter);
app.use("/announcements", announcementRouter);
app.use("/comments", commentRouter);
app.use("/dashboard", dashboardRouter);
app.use("/healthcheck", healthcheckRouter);

export { app };