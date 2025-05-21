import { Request, Response } from "express";
import Art from "../models/artModels";
import { cloudinary } from "../middleware/multer";

class ArtController {
	public async getAllArt(req: Request, res: Response): Promise<void> {
		try {
			const { page = 1, limit = 20 } = req.query;

			const artPieces = await Art.find()
				.populate("user")
				.sort({ createdAt: -1 })
				.skip((Number(page) - 1) * Number(limit))
				.limit(Number(limit));

			res
				.status(200)
				.json({ message: "All art pieces", artPieces, page, limit });
		} catch (error: any) {
			console.error("Error fetching art pieces:", error.stack);
			res
				.status(500)
				.json({ message: "Error fetching art pieces", error: error.message });
		}
	}

	public async getArtById(req: Request, res: Response): Promise<void> {
		try {
			const artId = req.params.id;
			const artPiece = await Art.findById(artId)
				.populate("user")
				.populate("likes");

			if (!artPiece) {
				res
					.status(404)
					.json({ message: `Art piece with id ${artId} not found` });
				return;
			}
			res.status(200).json({ message: `Art piece with id ${artId}`, artPiece });
		} catch (error: any) {
			console.error("Error fetching art piece:", error.stack);
			res
				.status(500)
				.json({ message: "Error fetching art piece", error: error.message });
		}
	}

	public async likeArt(req: Request, res: Response): Promise<void> {
		const id = req.params.id;
		const userId = req.body.userId;

		try {
			let artPiece = await Art.findById(id);
			if (!artPiece) {
				res.status(404).json({ message: `Art piece with id ${id} not found` });
				return;
			}

			const like = {
				userId: userId,
				liked: true,
				createdAt: new Date(),
			};
			artPiece.likes.push(like);

			await artPiece.save();

			res
				.status(200)
				.json({ message: `Art piece with id ${id} liked`, artPiece });
		} catch (error: any) {
			console.error("Error liking art piece:", error.stack);
			res
				.status(500)
				.json({ message: "Error liking art piece", error: error.message });
		}
	}

	public async unlikeArt(req: Request, res: Response): Promise<void> {
		const id = req.params.id;
		const userId = req.body.userId;
		let likes = [];

		try {
			const artPiece = await Art.findById(id);
			if (!artPiece) {
				res.status(404).json({ message: `Art piece with id ${id} not found` });
				return;
			}

			likes = artPiece.likes.filter(
				(like: any) => like.user.toString() !== userId
			);

			artPiece.likes = likes;
			await artPiece.save();

			res
				.status(200)
				.json({ message: `Art piece with id ${id} unliked`, artPiece });
		} catch (error: any) {
			console.error("Error unliking art piece:", error.stack);
			res
				.status(500)
				.json({ message: "Error unliking art piece", error: error.message });
		}
	}

	public async addComment(req: Request, res: Response): Promise<void> {
		const id = req.params.id;
		const userId = req.body.userId;
		const content = req.body.content;
		const comments = [];

		try {
			const artPiece = await Art.findById(id);
			if (!artPiece) {
				res.status(404).json({ message: `Art piece with id ${id} not found` });
				return;
			}

			const comment = {
				userId: userId,
				content: content,
				createdAt: new Date(),
			};
			comments.push(comment);
			artPiece.comments = comments;

			res.status(200).json({
				message: `Comment added to art piece with id ${id}`,
				artPiece,
			});
		} catch (error: any) {
			console.error("Error adding comment to art piece:", error.stack);
			res.status(500).json({
				message: "Error adding comment to art piece",
				error: error.message,
			});
		}
	}

	public async deleteComment(req: Request, res: Response): Promise<void> {
		const id = req.params.id;
		const userId = req.body.userId;
		let comments = [];

		try {
			const artPiece = await Art.findById(id);
			if (!artPiece) {
				res.status(404).json({ message: `Art piece with id ${id} not found` });
				return;
			}

			comments = artPiece.comments.filter(
				(comment: any) => comment.userId.toString() !== userId
			);

			artPiece.comments = comments;
			await artPiece.save();

			res.status(200).json({
				message: `Comment deleted from art piece with id ${id}`,
				artPiece,
			});
		} catch (error: any) {
			console.error("Error deleting comment from art piece:", error.stack);
			res.status(500).json({
				message: "Error deleting comment from art piece",
				error: error.message,
			});
		}
	}

	createArt = async (req: Request, res: Response): Promise<void> => {
		if (!req.user /*|| !req.user.isArtist */) {
			res.status(403).json({ message: "Only artists can create art" });
			return;
		}

		if (!req.file) {
			res.status(400).json({ message: "Please upload an image" });
			return;
		}

		try {
			const { artist, description, title } = req.body;
			const file = req.file as Express.Multer.File;

			if (!file || !artist || !title) {
				res.status(400).json({ message: "Please provide all required fields" });
				return;
			}

			const imageURL = await new Promise<string>((resolve, reject) => {
				cloudinary.uploader
					.upload_stream({ upload_preset: "art-gallery" }, (error, result) => {
						if (result) resolve(result.secure_url);
						else reject(error);
					})
					.end(file.buffer);
			});

			const newArt = new Art({
				art: imageURL,
				artist,
				description,
				title,
			});

			await newArt.save();
			res.status(201).json({ message: "Art piece created", art: newArt });
		} catch (error: any) {
			console.error("Error creating art piece:", error.stack);
			res
				.status(500)
				.json({ message: "Error creating art piece", error: error.message });
		}
	};

	public async updateArt(req: Request, res: Response): Promise<void> {
		try {
			const artId = req.params.id;
			const { artist, description, title } = req.body;
			const art = req.file?.path;

			const artPiece = await Art.findById(artId)
				.populate("likes")
				.populate("comments")
				.populate("artist");

			if (!artPiece) {
				res
					.status(404)
					.json({ message: `Art piece with id ${artId} not found` });
				return;
			}

			const updatedArt = await Art.findByIdAndUpdate(
				artId,
				{
					art: art || artPiece.art,
					artist: artist || artPiece.artist,
					description: description || artPiece.description,
					title: title || artPiece.title,
				},
				{ new: true }
			);

			res.status(200).json({
				message: `Art piece with id ${artId} updated`,
				art: updatedArt,
			});
		} catch (error: any) {
			console.error("Error updating art piece:", error.stack);
			res
				.status(500)
				.json({ message: "Error updating art piece", error: error.message });
		}
	}

	public async deleteArt(req: Request, res: Response): Promise<void> {
		try {
			const artId = req.params.id;

			const artPiece = await Art.findById(artId);
			if (!artPiece) {
				res
					.status(404)
					.json({ message: `Art piece with id ${artId} not found` });
				return;
			}

			await Art.findByIdAndDelete(artId);
			res
				.status(200)
				.json({ message: `Art piece with id ${artId} deleted`, artPiece });
		} catch (error: any) {
			console.error("Error deleting art piece:", error.stack);
			res
				.status(500)
				.json({ message: "Error deleting art piece", error: error.message });
		}
	}
}

export default new ArtController();
