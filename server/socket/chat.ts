import { Server } from "socket.io";
import http from "http";
import ChatRoom from "../models/chatModel";
import jwt from "jsonwebtoken";

export const initializeSocket = (server: http.Server) => {
	const io = new Server(server, {
		cors: {
			origin: process.env.FRONTEND_URL,
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	io.use((socket, next) => {
		const token = socket.handshake.auth.token;

		jwt.verify(
			token,
			process.env.JWT_SECRET!,
			async (err: any, decoded: any) => {
				if (err) {
					return next(new Error("Invalid token"));
				}
				socket.data.user = decoded;
				next();
			}
		);
	});

	io.on("connection", (socket) => {
		console.log("Connected to socket");
		socket.on("joinRoom", async (roomId: string) => {
			socket.join(roomId);
			console.log(`User joined room: ${roomId}`);

			try {
				const chatRoom = await ChatRoom.findOne({ roomId });

				if (!chatRoom) {
					const newRoom = new ChatRoom({ roomId });
					await newRoom.save();
				}
			} catch (error) {
				console.error("Error", error);
			}
		});

		socket.on(
			"chatMessage",
			async (data: { roomId: string; sender: string; message: string }) => {
				const { roomId, sender, message } = data;
				console.log(`Message in room ${roomId} from ${sender}: ${message}`);

				try {
					const chatRoom = await ChatRoom.findOne({ roomId });

					if (chatRoom) {
						chatRoom.messages.push({ roomId, sender, message });
						await chatRoom.save();

						io.to(data.roomId).emit("message", data);
					}
				} catch (error) {
					console.error("Error", console.error());
				}
			}
		);

		socket.on("disconnect", () => {
			console.log("User disconnected");
		});
	});
};
