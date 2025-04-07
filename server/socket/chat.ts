import { Server } from "socket.io";
import http from "http";
import ChatRoom from "../models/chatModel";
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
			const decoded = await jwt.verify(token, process.env.JWT_SECRET!);
			socket.data.user = decoded;
			next();
		} catch (err) {
			next(new Error("Authentication error"));
		}
	});

	io.on("connection", (socket) => {
		console.log("Connected to socket");

		socket.on("joinRoom", async (roomId: string) => {
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
				console.error("Error", error);
				socket.emit("error", { message: "Failed to join room" });
			}
		});

		socket.on(
			"chatMessage",
			async (data: { roomId: string; sender: any; message: string }) => {
				let { roomId, sender, message } = data;
				console.log(`Message in room ${roomId} from ${sender}: ${message}`);

				try {
					const chatRoom = await ChatRoom.findOne({ roomId });

					if (chatRoom) {
						if (sender && typeof sender === "string") {
							sender = new mongoose.Types.ObjectId(sender);
						}
						await ChatRoom.addMessage(roomId, {
							sender,
							message,
							timestamp: new Date(),
						});
						io.to(roomId).emit("message", data);
					} else {
						socket.emit("error", { message: "Room not found" });
					}
				} catch (error) {
					console.error("Error", error);
					socket.emit("error", { message: "Failed to send message" });
				}
			}
		);

		socket.on("disconnect", () => {
			console.log("User disconnected");
		});
	});
};
