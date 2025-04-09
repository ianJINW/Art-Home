import { Router } from "express";
import artController from "../controllers/artController";
import uploads from "../middleware/multer";
import { validateArtFields, validateObjectId } from "../middleware/validator";

const router = Router();

router
	.route("/")
	.get(artController.getAllArt)
	.post(
		validateObjectId,
		uploads.single("art"),
		validateArtFields,
		artController.createArt
	);
router
	.route("/:id")
	.get(artController.getArtById)
	.put(uploads.single("art"), artController.updateArt);

router
	.route("/:id/like")
	.post(artController.likeArt)
	.delete(artController.unlikeArt);
router
	.route("/:id/comment")
	.post(artController.addComment)
	.delete(artController.deleteComment);

export default router;
