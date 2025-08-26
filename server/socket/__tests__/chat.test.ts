import { Server } from "socket.io";
import { createServer } from "http";
import { io } from "socket.io-client";
import mongoose from "mongoose";

const httpServer = createServer();
const socketServer = new Server(httpServer);
const PORT = 3000;

describe("Chat Socket", () => {
	let clientSocket1: ReturnType<typeof io>;
	let clientSocket2: ReturnType<typeof io>;
	const mockUser1 = { _id: new mongoose.Types.ObjectId(), username: "user1" };
	const mockUser2 = { _id: new mongoose.Types.ObjectId(), username: "user2" };
	const roomId = new mongoose.Types.ObjectId().toString();

	beforeAll((done) => {
		// Set up the socket server
		socketServer.on("connection", (socket) => {
			socket.data.user = socket.handshake.auth.user;

			// Handle room joining
			socket.on("joinRoom", async (roomId, participants) => {
				await socket.join(roomId);
				socket.emit("roomJoined", { roomId, participants });
			});

			// Handle chat messages
			socket.on("chatMessage", async (data) => {
				const { roomId, sender, content } = data;
				socketServer.to(roomId).emit("message", {
					sender,
					content,
					timestamp: new Date(),
				});
			});
		});

		httpServer.listen(PORT, done);
	});

	beforeEach((done) => {
		// Connect two clients with mock user data
		clientSocket1 = io(`http://localhost:${PORT}`, {
			auth: { user: mockUser1 },
		});
		clientSocket2 = io(`http://localhost:${PORT}`, {
			auth: { user: mockUser2 },
		});

		let connected = 0;
		[clientSocket1, clientSocket2].forEach((socket) => {
			socket.on("connect", () => {
				connected++;
				if (connected === 2) done();
			});
		});
	});

	afterEach((done) => {
		clientSocket1.disconnect();
		clientSocket2.disconnect();
		done();
	});

	afterAll((done) => {
		socketServer.close();
		httpServer.close(done);
	});

	it("should allow users to join a room", (done) => {
		const participants = [mockUser1._id.toString(), mockUser2._id.toString()];

		// First user joins
		clientSocket1.emit("joinRoom", roomId, participants);

		clientSocket1.on("roomJoined", (data) => {
			expect(data.roomId).toBe(roomId);
			expect(data.participants).toEqual(expect.arrayContaining(participants));
			done();
		});
	});

	it("should send and receive messages in a room", (done) => {
		const testMessage = "Hello, World!";
		const participants = [mockUser1._id.toString(), mockUser2._id.toString()];

		// Both users join the room
		clientSocket1.emit("joinRoom", roomId, participants);
		clientSocket2.emit("joinRoom", roomId, participants);

		// Wait for both to join before sending message
		let joined = 0;
		[clientSocket1, clientSocket2].forEach((socket) => {
			socket.on("roomJoined", () => {
				joined++;
				if (joined === 2) {
					// Send message from user1
					clientSocket1.emit("chatMessage", {
						roomId,
						sender: mockUser1._id.toString(),
						content: testMessage,
					});
				}
			});
		});

		// User2 should receive the message
		clientSocket2.on("message", (data) => {
			expect(data.sender).toBe(mockUser1._id.toString());
			expect(data.content).toBe(testMessage);
			expect(data.timestamp).toBeDefined();
			done();
		});
	});
});
