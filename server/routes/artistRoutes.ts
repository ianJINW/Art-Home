import { Router } from "express";
import {
	createArtist,
	deleteArtist,
	getArtist,
	getArtists,
	updateArtist,
} from "../controllers/artistController";

const artistRouter = Router();

artistRouter.route("/").get(getArtists).post(createArtist);
artistRouter
	.route("/:id")
	.get(getArtist)
	.put(updateArtist)
	.delete(deleteArtist);

export default artistRouter;
