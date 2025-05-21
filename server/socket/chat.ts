import { Server } from "socket.io";
import http from "http";
import { ChatRoom, Message } from "../models/chatModel";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const initializeSocket = (server: http.Server) => {
	const io = new Server(server, {
		cors: {
			origin: process.env.FRONTEND_URL,
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token;
			if (!token) {
				throw new Error("Token is required");
			}
			const decoded = jwt.verify(token, process.env.JWT_SECRET!);
			socket.data.user = decoded;
			next();
		} catch (err: any) {
			console.error("Socket authentication error:", err.message);
			next(new Error("Authentication error: Invalid or missing token"));
		}
	});

	io.on("connection", (socket) => {
		console.log("Connected to socket");

		socket.on("joinRoom", async (roomId: string) => {
			if (!roomId) {
				socket.emit("error", { message: "Room ID is required" });
				return;
			}

			socket.join(roomId);
			console.log(`User joined room: ${roomId}`);

			try {
				let chatRoom = await ChatRoom.findOne({ roomId });

				if (!chatRoom) {
					chatRoom = new ChatRoom({ roomId });
					await chatRoom.save();
					socket.emit("roomCreated", { roomId });
				}
			} catch (error) {
				console.error("Error joining room:", error);
				socket.emit("error", { message: "Failed to join room" });
			}
		});

		socket.on(
			"chatMessage",
			async (data: { roomId: string; sender: string; message: string }) => {
				const { roomId, sender, message } = data;

				if (!roomId || !sender || !message) {
					socket.emit("error", { message: "Missing required fields" });
					return;
				}

				console.log(`Message in room ${roomId} from ${sender}: ${message}`);

				try {
					const chatRoom = await ChatRoom.findOne({ roomId });

					if (!chatRoom) {
						socket.emit("error", { message: "Room not found" });
						return;
					}

					const senderId = new mongoose.Types.ObjectId(sender);

					const newMessage = new Message({
						sender: senderId,
						content: message,
						chatRoom: chatRoom._id,
						timestamp: new Date(),
					});

					await newMessage.save();
					io.to(roomId).emit("message", { roomId, sender, message });
				} catch (error) {
					console.error("Error sending message:", error);
					socket.emit("error", { message: "Failed to send message" });
				}
			}
		);

		socket.on("disconnect", () => {
			console.log("User disconnected");
		});
	});
};
