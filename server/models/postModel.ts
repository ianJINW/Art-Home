import mongoose from 'mongoose';

const postShema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    commentsCount: {
        type: Number,
        default: 0,},
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Post = mongoose.model('Post', postShema);
export default Post;