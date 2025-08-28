import mongoose from "mongoose";
import { ChatRoom, Message } from "../models/chatModel";

const next = (error: Error) => {
	console.error(error);
	throw error;
};

const newMessage = async (data: {
	roomId: string;
	message: string;
	sender: string;
}) => {
	const { roomId, message, sender } = data;

	try {
		const chatRoom = await ChatRoom.findById(roomId);

		if (!chatRoom) next(new Error("Chat room not found"));

		const newMessage = new Message({
			sender: new mongoose.Types.ObjectId(sender),
			content: message,
			chatRoom: chatRoom?._id,
			timestamp: new Date(),
		});
await newMessage.save();
		const newmessage = await Message.findById(newMessage._id).populate("sender", "username");

		return newmessage;
	} catch (error: unknown) {
		console.log(`Error creating new message: ${error}`);
		next(
			new Error(
				`Failed to create new message: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			)
		);
	}


};

export default newMessage;
