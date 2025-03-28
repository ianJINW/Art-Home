import { Request, Response } from "express";
import mongoose from "mongoose";
import Artist from "../models/artistModels";

const handleError = (res: Response, error: any, statusCode = 400) => {
	console.error(error.stack || error.message);
	res
		.status(statusCode)
		.json({ message: error.message || "An error occurred" });
};

export const createArtist = async (req: Request, res: Response) => {
	try {
		const { name, bio, genre } = req.body;

		if (!name || !bio || !genre) {
			res.status(400).json({ message: "Name, bio, and genre are required" });
			return;
		}

		const artist = await Artist.create(req.body);
		res
			.status(201)
			.json({ message: "Artist created successfully", data: artist });
	} catch (error: any) {
		handleError(res, error, 500);
	}
};

export const getArtists = async (req: Request, res: Response) => {
	try {
		const artists = await Artist.find();
		res
			.status(200)
			.json({ message: "Artists retrieved successfully", data: artists });
	} catch (error: any) {
		handleError(res, error, 500);
	}
};

export const getArtist = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({ message: "Invalid artist ID" });
			return;
		}

		const artist = await Artist.findById(id).populate("works");
		if (!artist) {
			res.status(404).json({ message: `Artist with ID ${id} not found` });
			return;
		}

		res
			.status(200)
			.json({ message: "Artist retrieved successfully", data: artist });
	} catch (error: any) {
		handleError(res, error, 500);
	}
};

export const updateArtist = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({ message: "Invalid artist ID" });
			return;
		}

		const artist = await Artist.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!artist) {
			res.status(404).json({ message: `Artist with ID ${id} not found` });
			return;
		}

		res
			.status(200)
			.json({ message: "Artist updated successfully", data: artist });
	} catch (error: any) {
		handleError(res, error, 500);
	}
};

export const deleteArtist = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({ message: "Invalid artist ID" });
			return;
		}

		const artist = await Artist.findByIdAndDelete(id);
		if (!artist) {
			res.status(404).json({ message: `Artist with ID ${id} not found` });
			return;
		}

		res
			.status(200)
			.json({ message: "Artist deleted successfully", data: artist });
	} catch (error: any) {
		handleError(res, error, 500);
	}
};
