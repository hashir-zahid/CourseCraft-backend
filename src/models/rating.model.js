import mongoose, { Schema } from "mongoose";

const ratingSchema = new Schema(
    {
        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        stars: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        review: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export const Rating = mongoose.model("Rating", ratingSchema);