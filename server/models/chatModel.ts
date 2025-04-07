import mongoose, { Document, Schema, Types, Model } from "mongoose";

// IMessage interface with sender as ObjectId
export interface IMessage extends Document {
	sender: Types.ObjectId;
	message: string;
	timestamp: Date;
}

// IChatRoom interface definition
export interface IChatRoom extends Document {
	roomId: string;
	participants: Types.ObjectId[];
	messages: IMessage[];
	createdAt: Date;
	updatedAt: Date;
}

// Define the message schema
const messageSchema: Schema<IMessage> = new Schema({
	sender: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Extend Mongoose Model interface to include our static method
interface ChatRoomModel extends Model<IChatRoom> {
	addMessage(roomId: string, message: Partial<IMessage>): Promise<IChatRoom>;
}

// Define the chat room schema
const chatSchema: Schema<IChatRoom> = new Schema(
	{
		roomId: {
			type: String,
			required: true,
			unique: true,
		},
		participants: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
		],
		messages: [messageSchema],
	},
	{
		timestamps: true,
	}
);

// Static method for adding a message
chatSchema.statics.addMessage = async function (
	roomId: string,
	message: Partial<IMessage>
) {
	const chatRoom = await this.findOne({ roomId });
	if (!chatRoom) {
		throw new Error("Chat room not found");
	}
	// If the sender is provided as a string, convert it to ObjectId
	if (message.sender && typeof message.sender === "string") {
		message.sender = new mongoose.Types.ObjectId(message.sender);
	}
	// Push the message (cast to IMessage)
	chatRoom.messages.push(message as IMessage);
	await chatRoom.save();
	return chatRoom;
};

// Create the model using our extended ChatRoomModel interface
const ChatRoom = mongoose.model<IChatRoom, ChatRoomModel>(
	"ChatRoom",
	chatSchema
);

export default ChatRoom;
