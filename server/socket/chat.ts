import { Server } from "socket.io";
import http from "http";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ChatRoom, Message } from "../models/chatModel";

interface JwtPayloadWithUser {
  _id: string;
  username: string;
  email: string;
}

interface SocketData {
  user: {
    _id: string;
    username: string;
    email: string;
  };
  activeRooms: Set<string>;
}

interface ChatMessage {
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  content: string;
  timestamp: string;
  chatRoom?: string;
}

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    cookie: true,
  });

  const connectedUsers = new Map<string, Set<string>>();

  console.log("Socket initialized");
  io.use(async (socket, next) => {
    try {
      console.log("Socket authentication attempt...");
      const accessToken =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1] ||
        cookie.parse(socket.handshake.headers.cookie || "").accessToken;

      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET!
      ) as JwtPayloadWithUser;

      if (!decoded || !decoded._id) {
        return next(new Error("Authentication error"));
      }
      socket.data = { user: decoded, activeRooms: new Set<string>() };

      console.log("User authenticated:", decoded, decoded._id);

      connectedUsers.set(socket.id, new Set([decoded._id]));

      console.log("Connected users:", connectedUsers);
      /*       console.log(`User ${decoded.username} connected`)
       */
      next();
    } catch (err: any) {
      console.error("Socket authentication error:", err.message);
      next(new Error("Authentication error"));
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

        await socket.join(roomId);
        socket.data.activeRooms.add(roomId);

        if (!connectedUsers.has(roomId)) {
          connectedUsers.set(roomId, new Set());
        }
        connectedUsers.get(roomId)?.add(user._id);

        console.log(
          `User ${user.username
          } joined room: ${roomId} active rooms for user ${Array.from(
            connectedUsers.get(user._id) || []
          )}`
        );

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
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("leaveRoom", (roomId: string) => {
      console.log(`User ${user.username} leaving room: ${roomId}`);
      socket.leave(roomId);
      socket.emit("roomLeft", { roomId });
    });

    socket.on(
      "chatmessage",
      async (data: { roomId: string; sender: string; message: string }) => {
        const { roomId, sender, message } = data;
        console.log("Received message:", { roomId, sender, message });
        console.log("User data:", user);

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

          io.to(roomId).emit("chatmessage", populatedMessage);
          console.log("Message emitted:", populatedMessage);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    socket.on("disconnect", () => {
      connectedUsers.delete(user.id);



      console.log(`User ${user.username} disconnected`);
    });
  });

  return io;
};
