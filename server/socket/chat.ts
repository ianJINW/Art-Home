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
			const header = socket.request.headers.cookie;
			if (!header) throw new Error("Cookie missing!!");

			console.log(header);

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
		console.log(`%{user.username} Connected to socket`);

		socket.on("joinRoom", async (roomId: string, participants: string[]) => {
			if (!roomId || !participants || participants.length === 0) {
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

				console.log(chatRoom);
			} catch (error) {
				console.error("Error joining room:", error);
				socket.emit("error", { message: `Failed to join room ${error}` });
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
