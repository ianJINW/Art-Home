export interface AuthenticatedUser {
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
import transactione from "../utils/transactions";

const JWT_SECRET = process.env.JWT_SECRET as string;

const newChatFn = async (
	session: mongoose.ClientSession,
	req: Request,
	res: Response
) => {
	try {
		const { chatee } = req.body;

		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not authenticated" });
			return;
		}
		const me = (req.user as any)._id;

		const other = await User.findById(chatee);
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
			((req.user as any).blockedUsers || []).includes(other._id.toString())
		) {
			res.status(403).json({ error: "Error. Cannot chat with this user" });
			return;
		}
		const chat = await ChatRoom.findOne({
			participants: { $all: [me, chatee] },
		});

		if (!chat) {
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
			await chat.save({ session });
		}
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
		res.status(500).json({ error: "Failed to create new chat" });
	}
};

const sendMessageFn = async (
	session: mongoose.ClientSession,
	req: Request,
	res: Response
) => {
	console.log("Sending message", req.body);
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not authenticated" });
			return;
		}

		const chatId = String(req.params.id);
		const { message } = req.body;
		const senderId = (req.user as any)._id;

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

		await newMessage.save({ session });

		const messages = await Message.find({ chatRoom: chatId })
			.populate("sender", "username email")
			.sort({ timestamp: 1 })
			.session(session);

		res.status(201).json({ message: newMessage, messages });
	} catch (error) {
		res.status(500).json({ error: "Failed to send message" });
	}
};

const getMessagesFn = async (
	session: mongoose.ClientSession,
	req: Request,
	res: Response
) => {
	try {
		const chatId = req.params.id;
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
			.populate("chatRoom", "participants")
			.sort({ timestamp: 1 })
			.session(session);

		console.log;

		res.status(200).json({ messages });
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch messages" });
	}
};

const findUserChatRoomsFn = async (
	session: mongoose.ClientSession,
	req: Request,
	res: Response
) => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not authenticated" });
			return;
		}
		const userObjectId = new Types.ObjectId((req.user as any)._id);

		const chatRooms = await ChatRoom.find({ participants: userObjectId })
			.populate("participants", "username email")
			.sort({ updatedAt: -1 })
			.session(session);

		res.status(200).json({ chatRooms });
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch chat rooms" });
	}
};

const deleteChatRoomFn = async (
	session: mongoose.ClientSession,
	req: Request,
	res: Response
) => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not authenticated" });
			return;
		}
		const chatId = req.params.id;

		if (!chatId) {
			res.status(400).json({ error: "Chat ID is required" });
			return;
		}

		const chatRoom = await ChatRoom.findById(chatId);
		if (!chatRoom) {
			res.status(404).json({ error: "Chat room not found" });
			return;
		}

		if (
			!chatRoom.participants.includes(
				new mongoose.Types.ObjectId((req.user as any)._id)
			)
		) {
			res
				.status(403)
				.json({ error: "User not authorized to delete this chat" });
			return;
		}

		await ChatRoom.deleteOne({ _id: chatId }, { session });
		res.status(200).json({ message: "Chat room deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete chat room" });
	}
};

export const newChat = transactione(newChatFn);
export const sendMessage = transactione(sendMessageFn);
export const getMessages = transactione(getMessagesFn);
export const findUserChatRooms = transactione(findUserChatRoomsFn);
export const deleteChatRoom = transactione(deleteChatRoomFn);
