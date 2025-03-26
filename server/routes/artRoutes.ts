import { Router } from "express";
import artController from "../controllers/artController";
import uploads from "../middleware/multer";

const router = Router();

router.route("/").get(artController.getAllArt).post( uploads.single('art'), artController.createArt);
router
	.route("/:id")
	.get(artController.getArtById)
	.put(uploads.single("art"), artController.updateArt);

export default router;
