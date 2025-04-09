import { Router } from "express";
import {
	addMessageToRoom,
	createChatRoom,
	findUserChatRooms,
	getChatHistory,
} from "../controllers/chatController";

const chatRouter = Router();

chatRouter.route("/").get(findUserChatRooms).post(createChatRoom);
chatRouter.route("/:id").get(getChatHistory).post(addMessageToRoom);

export default chatRouter;
