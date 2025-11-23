"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.deleteChatRoom = exports.findUserChatRooms = exports.getMessages = exports.newChat = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const chatModel_1 = require("../models/chatModel");
const userModels_1 = __importDefault(require("../models/userModels"));
const transactions_1 = __importDefault(require("../utils/transactions"));
const JWT_SECRET = process.env.JWT_SECRET;
const newChatFn = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatee } = req.body;
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized: User not authenticated' });
            return;
        }
        const me = req.user._id;
        const other = yield userModels_1.default.findById(chatee);
        if (!other) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (other._id.toString() === me.toString()) {
            res.status(400).json({ error: 'You cannot chat with yourself' });
            return;
        }
        if (other.blockedUsers.includes(me) ||
            (req.user.blockedUsers || []).includes(other._id.toString())) {
            res.status(403).json({ error: 'Error. Cannot chat with this user' });
            return;
        }
        const chat = yield chatModel_1.ChatRoom.findOne({
            participants: { $all: [me, chatee] }
        });
        if (!chat) {
            const newChatRoom = new chatModel_1.ChatRoom({
                participants: [me, chatee],
                roomId: new mongoose_1.default.Types.ObjectId()
            });
            yield newChatRoom.save();
            res.status(201).json({ chat: newChatRoom });
            return;
        }
        if (!chat.participants || chat.participants.length === 0) {
            chat.participants = [me, chatee];
            yield chat.save({ session });
        }
        res.json({
            chat: {
                _id: chat._id,
                participants: chat.participants
            },
            otherUser: {
                _id: other._id,
                username: other.username,
                email: other.email,
                image: other.image,
                bio: other.bio
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create new chat' });
    }
});
/*
const sendMessageFn = async (
    session: mongoose.ClientSession,
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized: User not authenticated' })
            return
        }

        const messages = await newMessage({
            roomId: req.body.roomId,
            message: req.body.message,
            sender: req.body.sender
        })

        res.status(201).json({ messages })
        return
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' })
    }
} */
const getMessagesFn = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chatId = req.params.id;
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized: User not authenticated' });
            return;
        }
        if (!chatId) {
            res.status(400).json({ error: 'Chat ID is required' });
            return;
        }
        console.log('Fetching messages for chat ID:', chatId);
        const messages = yield chatModel_1.Message.find({ chatRoom: chatId })
            .populate('sender', 'username email')
            .populate('chatRoom', 'participants')
            .sort({ timestamp: 1 })
            .session(session);
        console.log('Messages fetched successfully:', messages);
        res.status(200).json({ messages });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
const findUserChatRoomsFn = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized: User not authenticated' });
            return;
        }
        const userObjectId = new mongoose_1.Types.ObjectId(req.user._id);
        const chatRooms = yield chatModel_1.ChatRoom.find({ participants: userObjectId })
            .populate('participants', 'username email')
            .sort({ updatedAt: -1 })
            .session(session);
        res.status(200).json({ chatRooms });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat rooms' });
    }
});
const deleteChatRoomFn = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized: User not authenticated' });
            return;
        }
        const chatId = req.params.id;
        if (!chatId) {
            res.status(400).json({ error: 'Chat ID is required' });
            return;
        }
        const chatRoom = yield chatModel_1.ChatRoom.findById(chatId);
        if (!chatRoom) {
            res.status(404).json({ error: 'Chat room not found' });
            return;
        }
        if (!chatRoom.participants.includes(new mongoose_1.default.Types.ObjectId(req.user._id))) {
            res.status(403).json({ error: 'User not authorized to delete this chat' });
            return;
        }
        yield chatModel_1.ChatRoom.deleteOne({ _id: chatId }, { session });
        res.status(200).json({ message: 'Chat room deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete chat room' });
    }
});
exports.newChat = (0, transactions_1.default)(newChatFn);
/* export const sendMessage = transactione(sendMessageFn)
 */ exports.getMessages = (0, transactions_1.default)(getMessagesFn);
exports.findUserChatRooms = (0, transactions_1.default)(findUserChatRoomsFn);
exports.deleteChatRoom = (0, transactions_1.default)(deleteChatRoomFn);
