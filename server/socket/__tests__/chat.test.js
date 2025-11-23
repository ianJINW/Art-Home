"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const socket_io_client_1 = require("socket.io-client");
const mongoose_1 = __importDefault(require("mongoose"));
const httpServer = (0, http_1.createServer)();
const socketServer = new socket_io_1.Server(httpServer);
const PORT = 3000;
describe("Chat Socket", () => {
    let clientSocket1;
    let clientSocket2;
    const mockUser1 = { _id: new mongoose_1.default.Types.ObjectId(), username: "user1" };
    const mockUser2 = { _id: new mongoose_1.default.Types.ObjectId(), username: "user2" };
    const roomId = new mongoose_1.default.Types.ObjectId().toString();
    beforeAll((done) => {
        // Set up the socket server
        socketServer.on("connection", (socket) => {
            socket.data.user = socket.handshake.auth.user;
            // Handle room joining
            socket.on("joinRoom", (roomId, participants) => __awaiter(void 0, void 0, void 0, function* () {
                yield socket.join(roomId);
                socket.emit("roomJoined", { roomId, participants });
            }));
            // Handle chat messages
            socket.on("chatMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
                const { roomId, sender, content } = data;
                socketServer.to(roomId).emit("message", {
                    sender,
                    content,
                    timestamp: new Date(),
                });
            }));
        });
        httpServer.listen(PORT, done);
    });
    beforeEach((done) => {
        // Connect two clients with mock user data
        clientSocket1 = (0, socket_io_client_1.io)(`http://localhost:${PORT}`, {
            auth: { user: mockUser1 },
        });
        clientSocket2 = (0, socket_io_client_1.io)(`http://localhost:${PORT}`, {
            auth: { user: mockUser2 },
        });
        let connected = 0;
        [clientSocket1, clientSocket2].forEach((socket) => {
            socket.on("connect", () => {
                connected++;
                if (connected === 2)
                    done();
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
