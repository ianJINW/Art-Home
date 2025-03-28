import { Router } from "express";
import {
	addMessageToRoom,
	createChatRoom,
	findUserChatRooms,
	getChatHistory,
} from "../controllers/chatController";

const router = Router();

router.route("/").get(findUserChatRooms).post(createChatRoom);
router.route("/:id").get(getChatHistory).post(addMessageToRoom);

export { router as ChatRoutes };
