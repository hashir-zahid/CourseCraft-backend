import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        lessons: [
            {
                type: Schema.Types.ObjectId,
                ref: "Lesson"
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        price: {
            type: Number,
            default: 0
        },
        thumbnail: {
            type: String // cloudinary url
        },
        category: {
            type: String
        },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"]
        },
        isPublished: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const Course = mongoose.model("Course", courseSchema);