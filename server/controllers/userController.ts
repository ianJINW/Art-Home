import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModels";
import bcrypt from "bcryptjs";
import { cloudinary } from "../middleware/multer";

const secretKey = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
	console.log("Request body:", req.body);

	const { email, username, password } = req.body;

	let imageURL = "";
	if (req.file) {
		if (req.body.imageBase64) {
			// Handle base64 image
			const base64Data = req.body.imageBase64.replace(
				/^data:image\/\w+;base64,/,
				""
			);
			const buffer = Buffer.from(base64Data, "base64");

			// Upload to Cloudinary using stream
			imageURL = await new Promise<string>((resolve, reject) => {
				cloudinary.uploader
					.upload_stream({ upload_preset: "art-gallery" }, (error, result) => {
						if (result) resolve(result.url);
						else reject(error);
					})
					.end(buffer);
			}).catch((error) => {
				res.status(500).json({ message: "Base64 Image upload failed", error });
				return "";
			});

			if (!imageURL) return;
		}
	} else if (req.file) {
		// Handle file upload if a file is provided
		const file = req.file as Express.Multer.File;
		if (!file) {
			res.status(400).json({ message: "No file uploaded" });
			return;
		}

		imageURL = await new Promise<string>((resolve, reject) => {
			cloudinary.uploader
				.upload_stream({ upload_preset: "art-gallery" }, (error, result) => {
					if (result) resolve(result.url);
					else reject(error);
				})
				.end(file.buffer);
		}).catch((error) => {
			res.status(500).json({ message: "Image upload failed", error });
			return "";
		});

		if (!imageURL) return;
	}

	if (!email || !username || !password) {
		res.status(400).json({ message: "Please enter all fields" });
		return;
	}

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			res.status(400).json({ message: "User already exists" });
			return;
		}
		console.log(imageURL);
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({
			email,
			username,
			password: hashedPassword,
			image: imageURL,
		});

		console.log("New user:", newUser);
		await newUser.save();

		res.status(201).json({ message: "User registered successfully" });
		return;
	} catch (error) {
		res.status(500).json({ message: "An error occurred", error });
		return;
	}
};

export const login = async (req: Request, res: Response) => {
	console.log("Request body:", req.body);

	const { email, password } = req.body;
	if (!email || !password) {
		res.status(400).json({ message: "Please enter all fields" });
		return;
	}

	try {
		const user = await User.findOne({ email });
		if (!user) {
			res.status(400).json({ message: "User does not exist" });
			return;
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			res.status(400).json({ message: "Invalid credentials" });
			return;
		}

		const payload = {
			id: user.id,
			email: user.email,
			username: user.username,
			isAdmin: user.isAdmin,
		};
		const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

		res.cookie("accessToken", token, { httpOnly: true });
		res.json({ message: "Login successful" });
		return;
	} catch (error) {
		res.status(500).json({ message: `An error occurred, ${error}` });
		return;
	}
};

export const getUser = async (req: Request, res: Response) => {
	try {
		const user = await User.findById(req.params.id).select("-password");
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}
		res.json(user);
		return;
	} catch (error) {
		res.status(500).json({ message: "An error occurred", error });
		return;
	}
};

export const getUsers = async (req: Request, res: Response) => {
	try {
		const users = await User.find().select("-password");
		res.json(users);
		return;
	} catch (error) {
		res.status(500).json({ message: "An error occurred", error });
		return;
	}
};

export const updateUser = async (req: Request, res: Response) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		user.username = req.body.username || user.username;
		user.email = req.body.email || user.email;
		user.isAdmin = req.body.isAdmin || user.isAdmin;
		await user.save();

		res.json({ message: "User updated" });
		return;
	} catch (error) {
		res.status(500).json({ message: "An error occurred", error });
		return;
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.json({ message: "User removed" });
		return;
	} catch (error) {
		res.status(500).json({ message: "An error occurred", error });
		return;
	}
};
