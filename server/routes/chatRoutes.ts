import { Router } from "express";
import {
/* 	sendMessage,
 */	newChat,
	findUserChatRooms,
	getMessages,
	deleteChatRoom,
} from "../controllers/chatController";

const chatRouter = Router();

chatRouter.route("/").get(findUserChatRooms).post(newChat);
chatRouter
	.route("/:id")
	.get(getMessages)
/* 	.post(sendMessage)
 */	.delete(deleteChatRoom);

export default chatRouter;
