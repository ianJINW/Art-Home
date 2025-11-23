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
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const chatModel_1 = require("../models/chatModel");
const sender_1 = __importDefault(require("../utils/sender"));
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
        cookie: true,
    });
    const connectedUsers = new Map();
    console.log("Socket initialized");
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            console.log("Socket authentication attempt...");
            const accessToken = socket.handshake.auth.token ||
                ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) ||
                cookie_1.default.parse(socket.handshake.headers.cookie || "").accessToken;
            const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
            if (!decoded || !decoded._id) {
                return next(new Error("Authentication error"));
            }
            socket.data = { user: decoded, activeRooms: new Set() };
            connectedUsers.set(socket.id, new Set([decoded._id]));
            console.log("Connected users:", connectedUsers);
            next();
        }
        catch (err) {
            console.error("Socket authentication error:", err.message);
            next(new Error("Authentication error"));
        }
    }));
    io.on("connection", (socket) => {
        const user = socket.data.user;
        console.log(`${user.username} Connected to socket`);
        socket.on("joinRoom", (roomId, participants) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
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
            if (!participants.every((id) => mongoose_1.default.Types.ObjectId.isValid(id))) {
                socket.emit("error", { message: "Invalid participant IDs" });
                return;
            }
            try {
                let chatRoom = yield chatModel_1.ChatRoom.findById(roomId);
                if (!chatRoom) {
                    chatRoom = new chatModel_1.ChatRoom({
                        _id: new mongoose_1.default.Types.ObjectId(roomId),
                        participants: participants,
                    });
                    yield chatRoom.save();
                    console.log("New chat room created:", chatRoom);
                }
                yield socket.join(roomId);
                socket.data.activeRooms.add(roomId);
                if (!connectedUsers.has(roomId)) {
                    connectedUsers.set(roomId, new Set());
                }
                (_a = connectedUsers.get(roomId)) === null || _a === void 0 ? void 0 : _a.add(user._id);
                console.log(`User ${user.username} joined room: ${roomId} active rooms for user ${Array.from(connectedUsers.get(user._id) || [])}`);
                io.to(roomId).emit("roomJoined", {
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                    },
                    roomId,
                });
                socket.emit("roomJoined", {
                    roomId,
                    participants: chatRoom.participants,
                });
            }
            catch (error) {
                console.error("Error joining room:", error);
                socket.emit("error", { message: "Failed to join room" });
            }
        }));
        socket.on("leaveRoom", (roomId) => {
            console.log(`User ${user.username} leaving room: ${roomId}`);
            socket.leave(roomId);
            socket.emit("roomLeft", { roomId });
        });
        socket.on("chat message", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { roomId } = data;
                console.log(`New chat message from ${data.sender}: ${data.message} ${data}`);
                const populatedMessage = yield (0, sender_1.default)({
                    roomId: data.roomId,
                    message: data.message,
                    sender: data.sender,
                });
                console.log(populatedMessage);
                io.to(roomId).emit("chat message", populatedMessage);
                console.log("Message emitted:", populatedMessage);
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        }));
        socket.on("disconnect", () => {
            connectedUsers.delete(user.id);
            console.log(`User ${user.username} disconnected`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
