import { Request, Response } from "express";
import mongoose from "mongoose";
import Artist from "../models/artistModels";

// Utility function for handling errors
const handleError = (res: Response, error: any, statusCode = 500) => {
	console.error(error.stack || error.message);
	res.status(statusCode).json({
		message: error.message || "An unexpected error occurred",
	});
};

// Create a new artist
export const createArtist = async (req: Request, res: Response) => {
	const { name, bio, socials, works, user } = req.body;

	// Debug log to check the request body
	console.log("Request body:", req.body);

	// Validate required fields
	if (!name || !bio || !socials || !Array.isArray(socials)) {
		res.status(400).json({ 
			message:
				"Name, bio, and socials are required, and socials must be an array",
		});
		return;
	}

	// Validate and convert the user field to ObjectId
	if (!mongoose.Types.ObjectId.isValid(user)) {
		res.status(400).json({
			message: "Invalid user ID",
		});
		return;
	}

	try {
		// Create the artist
		const artist = await Artist.create({
			name,
			bio,
			socials,
			works: new mongoose.Types.ObjectId(works),
			user: new mongoose.Types.ObjectId(user),
		});

		res.status(201).json({
			message: "Artist created successfully",
			data: artist,
		});
	} catch (error: any) {
		// Handle errors
		handleError(res, error);
	}
};

// Get all artists
export const getArtists = async (_req: Request, res: Response) => {
	try {
		const artists = await Artist.find().populate("user");
		res.status(200).json({
			message: "Artists retrieved successfully",
			data: artists,
		});
	} catch (error: any) {
		handleError(res, error);
	}
};

// Get a single artist by ID
export const getArtist = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400).json({
			message: "Invalid artist ID",
		});
		return;
	}=== "Anonymous" ? "View" : "Buy Now"

	try {
		const artist = await Artist.findById(id).populate("works").populate("user");
		if (!artist) {
			res.status(404).json({
				message: `Artist with ID ${id} not found`,
			});
			return;
		}

		res.status(200).json({
			message: "Artist retrieved successfully",
			data: artist,
		});
	} catch (error: any) {
		handleError(res, error);
	}
};

// Update an artist by ID
export const updateArtist = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { name, bio, socials, works } = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400).json({
			message: "Invalid artist ID",
		});
		return;
	}

	try {
		const artist = await Artist.findByIdAndUpdate(
			id,
			{ name, bio, socials, works },
			{
				new: true,
				runValidators: true,
			}
		);

		if (!artist) {
			res.status(404).json({
				message: `Artist with ID ${id} not found`,
			});
			return;
		}

		res.status(200).json({
			message: "Artist updated successfully",
			data: artist,
		});
	} catch (error: any) {
		handleError(res, error);
	}
};

// Delete an artist by ID
export const deleteArtist = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.status(400).json({
			message: "Invalid artist ID",
		});
		return;
	}

	try {
		const artist = await Artist.findByIdAndDelete(id);
		if (!artist) {
			res.status(404).json({
				message: `Artist with ID ${id} not found`,
			});
			return;
		}

		res.status(200).json({
			message: "Artist deleted successfully",
			data: artist,
		});
	} catch (error: any) {
		handleError(res, error);
	}
};
