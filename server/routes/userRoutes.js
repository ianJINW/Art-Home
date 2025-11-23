"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const multer_1 = __importDefault(require("../middleware/multer"));
const userRouter = (0, express_1.Router)();
userRouter.route("/").get(userController_1.getUsers).post(multer_1.default.single("profile"), userController_1.register);
userRouter
    .route("/:id")
    .get(userController_1.getUser)
    .put(multer_1.default.single("profile"), userController_1.updateUser)
    .delete(userController_1.deleteUser);
userRouter.post("/logout", userController_1.logout);
userRouter.post("/refresh", userController_1.refreshToken);
userRouter.route("/login").post(userController_1.login);
exports.default = userRouter;
