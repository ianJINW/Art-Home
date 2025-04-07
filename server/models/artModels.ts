import { Schema, model, Document } from "mongoose";

export interface IArt extends Document {
	title: string;
	artist: string;
	art: string;
	description?: string;
	likes: ILike[];
	comments: IComment[];
	createdAt: Date;
	updatedAt: Date;
}

interface ILike {
	userId: string;
	liked: boolean;
}

interface IComment {
	content: string;
	userId: string;
	createdAt: Date;
}

const LikeSchema: Schema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	liked: { type: Boolean, default: false },
});

const commentSchema: Schema = new Schema({
	content: { type: String, required: true, trim: true },
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	createdAt: { type: Date, default: Date.now },
});

const ArtSchema: Schema = new Schema({
	title: { type: String, required: true, trim: true, unique: true },
	artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
	art: { type: String, required: true },
	description: { type: String, trim: true },
	likes: [LikeSchema],
	comments: [commentSchema],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

commentSchema.index({ createdAt: -1 });
ArtSchema.index({ createdAt: -1, updatedAt: -1, author: 1 });

const Art = model<IArt>("Art", ArtSchema);

export default Art;
