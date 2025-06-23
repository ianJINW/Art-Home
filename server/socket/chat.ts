import { Server } from "socket.io";
import http from "http";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ChatRoom, Message } from "../models/chatModel";

export const initializeSocket = (server: http.Server) => {
	const io = new Server(server, {
		cors: {
			origin: process.env.FRONTEND_URL,
			methods: ["GET", "POST"],
			credentials: true,
		},
		cookie: true,
	});

	io.use(async (socket, next) => {
		try {
			console.log("Socket authentication attempt...");

			const header = socket.request.headers.cookie;
			if (!header) throw new Error("Cookie missing!!");

			const { accessToken } = cookie.parse(header);
			if (!accessToken) throw new Error("No cookies");

			const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!);
			socket.data.user = decoded;
			next();
		} catch (err: any) {
			console.error("Socket authentication error:", err.message);
			next(new Error("Authentication error: Invalid or missing token"));
		}
	});

	io.on("connection", (socket) => {
		const user = socket.data.user;
		console.log(`${user.username} Connected to socket`);

		socket.on("joinRoom", async (roomId: string, participants: string[]) => {
			console.log("Join room attempt:", {
				roomId,
				participants,
				user: user._id,
			});

			if (!roomId || !participants || participants.length < 2) {
				socket.emit("error", { message: "Invalid room data" });
				return;
			}

			// Ensure valid MongoDB ObjectIds
			if (!participants.every((id) => mongoose.Types.ObjectId.isValid(id))) {
				socket.emit("error", { message: "Invalid participant IDs" });
				return;
			}

			try {
				let chatRoom = await ChatRoom.findById(roomId);

				if (!chatRoom) {
					chatRoom = new ChatRoom({
						_id: new mongoose.Types.ObjectId(roomId),
						participants: participants,
					});
					await chatRoom.save();
					console.log("New chat room created:", chatRoom);
				}

				socket.join(roomId);
				console.log(`User ${user.username} joined room: ${roomId}`);

				socket.emit("roomJoined", {
					roomId,
					participants: chatRoom.participants,
				});
			} catch (error) {
				console.error("Error joining room:", error);
				socket.emit("error", { message: "Failed to join room" });
			}
		});

		socket.on(
			"chatMessage",
			async (data: { roomId: string; sender: string; message: string }) => {
				const { roomId, sender, message } = data;
				console.log("Received message:", { roomId, sender, message });

				if (!roomId || !sender || !message) {
					socket.emit("error", { message: "Missing message data" });
					return;
				}

				try {
					const chatRoom = await ChatRoom.findById(roomId);
					if (!chatRoom) {
						socket.emit("error", { message: "Chat room not found" });
						return;
					}

					const newMessage = new Message({
						sender: new mongoose.Types.ObjectId(sender),
						content: message,
						chatRoom: chatRoom._id,
						timestamp: new Date(),
					});

					await newMessage.save();

					// Emit the populated message
					const populatedMessage = await Message.findById(newMessage._id)
						.populate("sender", "username email")
						.lean();

					io.to(roomId).emit("message", populatedMessage);
					console.log("Message emitted:", populatedMessage);
				} catch (error) {
					console.error("Error sending message:", error);
					socket.emit("error", { message: "Failed to send message" });
				}
			}
		);

		socket.on("disconnect", () => {
			console.log(`User ${user.username} disconnected`);
		});
	});

	return io;
};
