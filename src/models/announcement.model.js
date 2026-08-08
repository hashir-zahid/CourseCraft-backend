import mongoose, { Schema } from "mongoose";

const announcementSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);