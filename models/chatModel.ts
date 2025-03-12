import mongoose, { Schema } from "mongoose";

const ChatRoomSchema: Schema = new Schema({
	roomId: {
		type: String,
		required: true,
		unique: true,
	},
	artist: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	messages: [
		{
			sender: { type: String, required: true },
			message: { type: String, required: true },
			createdAt: { type: Date, default: Date.now },
		},
	],
});

export default mongoose.model("ChatRoom", ChatRoomSchema);
