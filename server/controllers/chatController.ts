import { Types } from "mongoose";
import ChatRoom, { IMessage } from "../models/chatModel";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Artist from "../models/artistModels";

// Create a new chat room
export const createChatRoom = async (req: Request, res: Response) => {
	try {
		const { participants, roomName } = req.body;
		if (!participants || !Array.isArray(participants)) {
			console.log("ni kubad chatcotroller line 12");
			res.status(400).json({ error: "Invalid participants array" });
			return;
		}

		const validArtists = await Artist.find({
			_id: { $in: participants.map((id: string) => new Types.ObjectId(id)) },
		});

		if (validArtists.length !== participants.length) {
			res.status(400).json({ error: "Invalid artist IDs" });
			return;
		}
		const token = req.cookies.accessToken;
		if (!token) {
			res.status(401).json({ error: "Unauthorized: Token is missing" });
			return;
		}

		const roomId = roomName ? roomName : participants.sort().join("_");
		const chatRoom = new ChatRoom({
			roomId,
			participants,
			messages: [],
		});
		await chatRoom.save();
		console.info("Chat room created:", chatRoom);
		res.status(201).json({ chatRoom });
	} catch (error) {
		console.error("Error creating chat room:", error);
		res.status(500).json({ error: "Failed to create chat room" });
	}
};

// Add a message to a chat room
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

		const updatedRoom = await ChatRoom.findOneAndUpdate(
			{ roomId },
			{ $push: { messages: newMessage } },
			{ new: true }
		);

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

// Get chat history for a room
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

// Find all chat rooms for a user
export const findUserChatRooms = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            res.status(401).json({ error: "Unauthorized: Token is missing" });
            return;
        }

        const secretKey = process.env.JWT_SECRET as string;
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, secretKey) as { id: string };
        } catch (err) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }

        const userId = decodedToken.id;
        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        // Convert userId to ObjectId
        const chatRooms = await ChatRoom.find({ participants: new Types.ObjectId(userId) })
            .populate("participants", "username email")
            .sort("-updatedAt");

        res.status(200).json({ chatRooms });
    } catch (error) {
        console.error("Error finding user chat rooms:", error);
        res.status(500).json({ error: "Failed to find user chat rooms" });
    }
};