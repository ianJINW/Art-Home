interface AuthenticatedUser {
	_id: string;
	username: string;
	email: string;
	image?: string;
	bio?: string;
	blockedUsers: string[];
}

import mongoose, { Types } from "mongoose";
import { ChatRoom, IMessage, Message } from "../models/chatModel";
import { Request, Response } from "express";
import User from "../models/userModels";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Create or retrieve a chat room
export const newChat = async (
	req: Request & { user?: AuthenticatedUser },
	res: Response
) => {
	try {
		// 1. Extract the target user ID from the request body
		const { chatee } = req.body;

		// 2. Ensure the request is authenticated
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not authenticated" });
			return;
		}
		const me = req.user._id;

		// 3. Look up the “other” user by ID
		const other = await User.findById(chatee);
		if (!other) {
			res.status(404).json({ error: "User not found" });
			return;
		}

		// 4. Prevent chatting with yourself
		if (other._id.toString() === me.toString()) {
			res.status(400).json({ error: "You cannot chat with yourself" });
			return;
		}

		console.log("I have blocked:", req.user.blockedUsers, me);
		console.log("They have blocked me:", other.blockedUsers, other);

		// 5. Respect blocking: if either has blocked the other, forbid chat
		if (
			other.blockedUsers.includes(me) ||
			req.user.blockedUsers.includes(other._id.toString())
		) {
			res.status(403).json({ error: "Error. Cannot chat with this user" });
			return;
		}

		const chat = await ChatRoom.findOne({
			participants: { $all: [me, chatee] },
		});

		if (!chat) {
			// 6. If no chat room exists, create a new one
			const newChatRoom = new ChatRoom({
				participants: [me, chatee],
				roomId: new mongoose.Types.ObjectId(),
			});
			await newChatRoom.save();
			res.status(201).json({ chat: newChatRoom });
			return;
		}

		if (!chat.participants || chat.participants.length === 0) {
			chat.participants = [me, chatee];
			await chat.save();
		}

		// 8. Return the chat room and the other user’s public profile
		res.json({
			chat: {
				_id: chat._id,
				participants: chat.participants,
			},
			otherUser: {
				_id: other._id,
				username: other.username,
				email: other.email,
				image: other.image,
				bio: other.bio,
			},
		});
	} catch (error) {
		console.error("Error in newChat:", error);
		res.status(500).json({ error: "Failed to create new chat" });
	}
};

// Send a message in a chat room
export const sendMessage = async (
	req: Request & { user?: AuthenticatedUser },
	res: Response
) => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not authenticated" });
			return;
		}
		const { chatId } = req.params;
		const { message } = req.body;
		const senderId = req.user._id;

		if (!chatId || !message) {
			res.status(400).json({ error: "Missing required fields" });
			return;
		}

		const chatRoom = await ChatRoom.findById(chatId);
		if (!chatRoom) {
			res.status(404).json({ error: "Chat room not found" });
			return;
		}

		if (
			!chatRoom.participants.includes(new mongoose.Types.ObjectId(senderId))
		) {
			res.status(403).json({ error: "User not authorized to send message" });
			return;
		}

		const newMessage = new Message({
			sender: new mongoose.Types.ObjectId(senderId),
			content: message,
			chatRoom: chatId,
			timestamp: new Date(),
		}) as IMessage;

		await newMessage.save();
		res.status(201).json({ message: newMessage });
	} catch (error) {
		console.error("Error in sendMessage:", error);
		res.status(500).json({ error: "Failed to send message" });
	}
};

// Retrieve messages from a chat room
export const getMessages = async (
	req: Request & { user?: AuthenticatedUser },
	res: Response
) => {
	try {
		const { chatId } = req.params;
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not authenticated" });
			return;
		}
		if (!chatId) {
			res.status(400).json({ error: "Chat ID is required" });
			return;
		}

		const messages = await Message.find({ chatRoom: chatId })
			.populate("sender", "username email")
			.sort({ timestamp: -1 });

		res.status(200).json({ messages });
	} catch (error) {
		console.error("Error fetching messages:", error);
		res.status(500).json({ error: "Failed to fetch messages" });
	}
};

// Find all chat rooms for the authenticated user
export const findUserChatRooms = async (
	req: Request & { user?: AuthenticatedUser },
	res: Response
) => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not authenticated" });
			return;
		}
		const userObjectId = new Types.ObjectId(req.user._id);

		const chatRooms = await ChatRoom.find({ participants: userObjectId })
			.populate("participants", "username email")
			.sort({ updatedAt: -1 });

		res.status(200).json({ chatRooms });
	} catch (error) {
		console.error("Error fetching chat rooms:", error);
		res.status(500).json({ error: "Failed to fetch chat rooms" });
	}
};
