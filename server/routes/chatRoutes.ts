import { Router } from "express";
import {
	sendMessage,
	newChat,
	findUserChatRooms,
	getChatHistory,
} from "../controllers/chatController";

const chatRouter = Router();

chatRouter.route("/").get(findUserChatRooms).post(newChat);
chatRouter.route("/:id").get(getChatHistory).post(sendMessage);

export default chatRouter;
