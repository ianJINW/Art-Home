import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const validateObjectId = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400).json({ message: "Invalid ID format" });
		return;
	}
	next();
};

export const validateArtFields = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { title, artist, description } = req.body;

	if (!title || !artist || !description) {
		res
			.status(400)
			.json({ message: "Title, artist, and description are required" });
		return;
	}

	next();
};
