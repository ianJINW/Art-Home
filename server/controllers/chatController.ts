import mongoose, { Types } from "mongoose";
import { ChatRoom, IMessage, Message } from "../models/chatModel";
import { Request, Response } from "express";
import User from "../models/userModels";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Middleware to authenticate user via token
export const authenticate = (req: Request, res: Response, next: Function) => {
	const token = req.cookies.accessToken;
	if (!token) {
		res.status(401).json({ error: "Missing token" });
		return;
	}
	try {
		const payload = jwt.verify(token, JWT_SECRET) as { id: string };
		req.user = { _id: payload.id, blockedUsers: [] }; // Blocked users can be fetched if needed
		next();
	} catch (err) {
		console.error("Token verification failed:", err);
		res.status(401).json({ error: "Invalid token" });
	}
};

// Create or retrieve a chat room
export const newChat = async (req: Request, res: Response) => {
	try {
		const { otherUserId } = req.params;
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not authenticated" });
			return;
		}
		const me = req.user._id;

		const other = await User.findById(otherUserId);
		if (!other) {
			res.status(404).json({ error: "User not found" });
			return;
		}

		if (other._id.toString() === me.toString()) {
			res.status(400).json({ error: "You cannot chat with yourself" });
			return;
		}

		if (
			other.blockedUsers.includes(me) ||
			req.user.blockedUsers.includes(other._id.toString())
		) {
			res.status(403).json({ error: "Error. Cannot chat with this user" });
			return;
		}

		const chat = await ChatRoom.findOneAndUpdate(
			{ participants: { $all: [me, otherUserId] } },
			{ $set: { participants: [me, otherUserId] } },
			{ upsert: true, new: true }
		);

		res.json({
			chat,
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
export const sendMessage = async (req: Request, res: Response) => {
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
export const getMessages = async (req: Request, res: Response) => {
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

// Get chat history for a specific room
export const getChatHistory = async (req: Request, res: Response) => {
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
		console.error("Error fetching chat history:", error);
		res.status(500).json({ error: "Failed to fetch chat history" });
	}
};

// Find all chat rooms for the authenticated user
export const findUserChatRooms = async (req: Request, res: Response) => {
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
