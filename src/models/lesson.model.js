import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const lessonSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary url
            required: true
        },
        thumbnail: {
            type: String // cloudinary url (optional)
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        order: {
            type: Number,
            required: true
        },
        isPreview: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

lessonSchema.plugin(mongooseAggregatePaginate);

export const Lesson = mongoose.model("Lesson", lessonSchema);