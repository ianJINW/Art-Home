import mongoose, { Document, Schema } from "mongoose";

interface IMessage {
	roomId: string;
	sender: string;
	message: string;
}

interface IChatRoom extends Document {
	roomId: string;
	messages: IMessage[];
}

const chatSchema: Schema = new Schema({
	roomId: { type: String, required: true },
	messages: { type: Array, default: [] },
});

const ChatRoom = mongoose.model<IChatRoom>("ChatRoom", chatSchema);

export default ChatRoom;
