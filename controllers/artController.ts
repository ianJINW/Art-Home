import { Request, Response } from "express";
import Art from "../models/artModels";

class ArtController {
	public async getAllArt(req: Request, res: Response): Promise<void> {
		try {
			const artPieces = await Art.find();

			res.status(200).json({ message: "All art pieces", artPieces });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Error fetching art pieces" });
		}
	}

	public async getArtById(req: Request, res: Response): Promise<void> {
		try {
			const artId = req.params.id;

			const artPiece = await Art.findById(artId);
			if (!artPiece) {
				res
					.status(404)
					.json({ message: `Art piece with id ${artId} not found` });
				return;
			}

			res.status(200).json({ message: `Art piece with id ${artId}`, artPiece });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Error fetching art piece" });
		}
	}

	public async createArt(req: Request, res: Response): Promise<void> {
		try {
			const { artist, description, title } = req.body;
			const art = req.file?.path;

			if (!art || !artist || !title) {
				res.status(400).json({ message: "Please provide all required fields" });
				return;
			}

			const newArt = new Art({
				art,
				artist,
				description,
				title,
			});
			res.status(201).json({ message: "Art piece created", art: newArt });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: `Error creating art piece: ${error}` });
		}
	}

	public async updateArt(req: Request, res: Response): Promise<void> {
		try {
			const artId = req.params.id;
			const { artist, description, title } = req.body;
			const art = req.file?.path;

			const artPiece = await Art.findById(artId);
			if (!artPiece) {
				res
					.status(404)
					.json({ message: `Art piece with id ${artId} not found` });
				return;
			}

			const updatedArt = await Art.findByIdAndUpdate(artId, {
				art: art || artPiece.art,
				artist: artist || artPiece.artist,
				description: description || artPiece.description,
				title: title || artPiece.title,
			});

			res.status(200).json({
				message: `Art piece with id ${artId} updated`,
				art: updatedArt,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Error updating art piece" });
		}
	}

	public async deleteArt(req: Request, res: Response): Promise<void> {
		try {
			const artId = req.params.id;

			const artPiece = await Art.findByIdAndDelete(artId);

			res
				.status(200)
				.json({ message: `Art piece with id ${artId} deleted`, artPiece });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Error deleting art piece" });
		}
	}
}

export default new ArtController();
