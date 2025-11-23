"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const chatRouter = (0, express_1.Router)();
chatRouter.route("/").get(chatController_1.findUserChatRooms).post(chatController_1.newChat);
chatRouter
    .route("/:id")
    .get(chatController_1.getMessages)
    /* 	.post(sendMessage)
     */ .delete(chatController_1.deleteChatRoom);
exports.default = chatRouter;
