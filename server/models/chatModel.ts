import mongoose, { Document, Schema, Types, Model } from "mongoose";

// Interface for a Message
export interface IMessage extends Document {
	sender: Types.ObjectId;
	content: string;
	timestamp: Date;
	chatRoom: Types.ObjectId;
}

// Interface for a Chat Room
export interface IChatRoom extends Document {
	participants: Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

// Message Schema
const messageSchema: Schema<IMessage> = new Schema({
	sender: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	content: {
		type: String,
		required: true,
		trim: true,
	},
	chatRoom: {
		type: Schema.Types.ObjectId,
		ref: "ChatRoom",
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Chat Room Schema
const chatRoomSchema: Schema<IChatRoom> = new Schema(
	{
		participants: {
			type: [Schema.Types.ObjectId],
			ref: "User",
			required: true,
			validate: {
				validator: (arr: Types.ObjectId[]) =>
					arr.length >= 2 && new Set(arr.map(String)).size === arr.length,
				message: "At least two unique participants are required.",
			},
		},
	},
	{ timestamps: true }
);

chatRoomSchema.statics.addMessage = async function (
	roomId: string,
	message: IMessage
): Promise<void> {
	try {
		const chatRoom = await this.findById(roomId);
		if (!chatRoom) {
			throw new Error("Chat room not found");
		}
		chatRoom.updatedAt = new Date();
		await chatRoom.save();
	} catch (error) {
		console.error("Error adding message:", error);
		throw error;
	}
};
// Create Models
const ChatRoom = mongoose.model<IChatRoom>("ChatRoom", chatRoomSchema);
const Message = mongoose.model<IMessage>("Message", messageSchema);

export { ChatRoom, Message };
