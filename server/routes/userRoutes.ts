import { Router } from "express";
import {
	deleteUser,
	getUser,
	getUsers,
	login,
	logout,
	refreshToken,
	register,
	updateUser,
} from "../controllers/userController";
import uploads from "../middleware/multer";
import { authToken } from "../utils/jwt";

const userRouter = Router();

userRouter.route("/").get(getUsers).post(uploads.single("profile"), register);

userRouter
	.route("/:id")
	.get(getUser)
	.put(authToken, uploads.single("profile"), updateUser)
	.delete(deleteUser);

userRouter.post("/logout", logout);
userRouter.post("/refresh", refreshToken);

userRouter.route("/login").post(login);

export default userRouter;
