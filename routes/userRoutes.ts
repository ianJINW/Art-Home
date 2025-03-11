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

const router = Router();

router.route("/").get(getUsers).post(uploads.single("profile"), register);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
router.route("/login").post(login);

export default router;
