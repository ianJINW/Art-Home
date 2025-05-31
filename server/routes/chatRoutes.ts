import { Router } from "express";
import {
	sendMessage,
	newChat,
	findUserChatRooms,
	getMessages,
} from "../controllers/chatController";

const chatRouter = Router();

chatRouter.route("/").get(findUserChatRooms).post(newChat);
chatRouter.route("/:id").get(getMessages).post(sendMessage);

export default chatRouter;
