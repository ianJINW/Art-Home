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
const mongoose_1 = __importDefault(require("mongoose"));
const chatModel_1 = require("../models/chatModel");
const next = (error) => {
    console.error(error);
    throw error;
};
const newMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, message, sender } = data;
    try {
        const chatRoom = yield chatModel_1.ChatRoom.findById(roomId);
        if (!chatRoom)
            next(new Error("Chat room not found"));
        const newMessage = new chatModel_1.Message({
            sender: new mongoose_1.default.Types.ObjectId(sender),
            content: message,
            chatRoom: chatRoom === null || chatRoom === void 0 ? void 0 : chatRoom._id,
            timestamp: new Date(),
        });
        yield newMessage.save();
        const newmessage = yield chatModel_1.Message.findById(newMessage._id).populate("sender", "username");
        return newmessage;
    }
    catch (error) {
        console.log(`Error creating new message: ${error}`);
        next(new Error(`Failed to create new message: ${error instanceof Error ? error.message : "Unknown error"}`));
    }
});
exports.default = newMessage;
