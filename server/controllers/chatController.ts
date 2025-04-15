import { Types } from "mongoose";
import ChatRoom, { IMessage } from "../models/chatModel";
import { Request, Response } from "express";

export const createChatRoom = async (req: Request, res: Response) => {
	try {
		const { participants, roomName } = req.body;
		if (!participants || !Array.isArray(participants)) {
			res.status(400).json({ error: "Invalid participants array" });
			return;
		}

		const roomId = roomName ? roomName : participants.sort().join("_");
		const chatRoom = new ChatRoom({
			roomId,
			participants,
			messages: [],
		});
		await chatRoom.save();
		res.status(201).json({ chatRoom });
	} catch (error) {
		console.error("Error creating chat room:", error);
		res.status(500).json({ error: "Failed to create chat room" });
	}
};

export const addMessageToRoom = async (req: Request, res: Response) => {
	try {
		const { roomId, senderId, message } = req.body;
		if (!roomId || !senderId || !message) {
			res.status(400).json({ error: "Missing required fields" });
			return;
		}

		const newMessage: Partial<IMessage> = {
			sender: senderId,
			message,
			timestamp: new Date(),
		};

		const updatedRoom = await ChatRoom.addMessage(roomId, newMessage);
		if (!updatedRoom) {
			res.status(404).json({ error: "Chat room not found" });
			return;
		}
		res.status(200).json({ updatedRoom });
	} catch (error) {
		console.error("Error adding message to room:", error);
		res.status(500).json({ error: "Failed to add message to chat room" });
	}
};

export const getChatHistory = async (req: Request, res: Response) => {
	try {
		const { roomId } = req.params;
		if (!roomId) {
			res.status(400).json({ error: "Room ID is required" });
			return;
		}

		const chatRoom = await ChatRoom.findOne({ roomId });
		if (!chatRoom) {
			res.status(404).json({ error: "Chat room not found" });
			return;
		}
		res.status(200).json({ messages: chatRoom.messages || [] });
	} catch (error) {
		console.error("Error fetching chat history:", error);
		res.status(500).json({ error: "Failed to fetch chat history" });
	}
};

export const findUserChatRooms = async (req: Request, res: Response) => {
	try {
		const token = req.cookies.accessToken;
		const { userId } = req.params;
		if (!userId) {
			res.status(400).json({ error: "User ID is required" });
			return;
		}

		const chatRooms = await ChatRoom.find({ participants: userId })
			.populate("participants", "username email")
			.sort("-updatedAt");
		res.status(200).json({ chatRooms });
	} catch (error) {
		console.error("Error finding user chat rooms:", error);
		res.status(500).json({ error: "Failed to find user chat rooms" });
	}
};
