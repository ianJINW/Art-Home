import { Router } from "express";
import {
	deleteUser,
	getUser,
	getUsers,
	login,
	register,
	updateUser,
} from "../controllers/userController";
import uploads from "../middleware/multer";

const userRouter = Router();

userRouter.route("/").get(getUsers).post(uploads.single("profile"), register);
userRouter.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
userRouter.route("/login").post(login);

export default userRouter;
