import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    members: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        },
    ],
    posts: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        },
    ],
    admins: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        },
    ],
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "",
    },
    });

const groupModel = mongoose.model("Group", groupSchema);

export default groupModel;