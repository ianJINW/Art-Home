import validator from "validator";
import bcrypt from "bcryptjs";
import { cloudinary } from "../middleware/multer";
import comparePassword from "../models/userModels";
import jwt from "jsonwebtoken";

import User from "../models/userModels";
import { Request, Response } from "express";

const secretKey = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
	console.log("Request body:", req.body);

	const { email, username, password } = req.body;

	// Validate input
	if (!email || !username || !password) {
		res.status(400).json({ message: "Please enter all fields" });
		console.log("hello");
		return;
	}

	if (!validator.isEmail(email)) {
		res.status(400).json({ message: "Invalid email format" });
		console.log("hapsa");
		return;
	}

	if (password.length < 8) {

		res
			.status(400)
			.json({ message: "Password must be at least 8 characters long" });
		console.log("again with the passwords");
		return;
	}

	let imageURL = "";

	// Handle image upload
	try {
		if (req.body.imageBase64) {
			const base64Data = req.body.imageBase64.replace(
				/^data:image\/\w+;base64,/,
				""
			);
			const buffer = Buffer.from(base64Data, "base64");

			imageURL = await new Promise<string>((resolve, reject) => {
				cloudinary.uploader
					.upload_stream({ upload_preset: "art-gallery" }, (error, result) => {
						if (result) resolve(result.url);
						else reject(error);
					})
					.end(buffer);
			});
			console.log('Fix the imagse upload');
		} else if (req.file) {
			const file = req.file as Express.Multer.File;

			imageURL = await new Promise<string>((resolve, reject) => {
				cloudinary.uploader
					.upload_stream({ upload_preset: "art-gallery" }, (error, result) => {
						if (result) resolve(result.url);
						else reject(error);
					})
					.end(file.buffer);
				console.log("Image uploaded successfully:", imageURL);
			});
		} 
	} catch (error) {
		console.error("Error uploading image:", error);
		res.status(500).json({ message: "Image upload failed", error });
		return;
	}

	// Check if user already exists
	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			console.log("hhhhheeee");
			res.status(400).json({ message: "User already exists" });
			return;
		}

		// Create new user
		const newUser = new User({
			email,
			username,
			password,
			image: imageURL,
		});

		await newUser.save();
		console.log("User created successfully:", newUser);
		// Respond with success
		res.status(201).json({
			message: "User registered successfully",
			user: {
				id: newUser._id,
				email: newUser.email,
				username: newUser.username,
				image: newUser.image,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "An error occurred", error });
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
			console.log("User not found");
			res.status(400).json({ message: "User does not exist" });
			return;
		}

		console.log("User from database:", user);

		const isMatch = await user.comparePassword(password);
		console.log("Password match:", isMatch);
		if (!isMatch) {
			console.log("Password does not match");
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
		const refreshToken = jwt.sign(payload, secretKey, { expiresIn: "5h" });

		res.cookie("accessToken", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});

		res.json({
			message: "Login successful",
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				image: user.image,
			},
			token,
		});
		return;
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).json({ message: `An error occurred, ${error}` });
		return;
	}
};

export const refreshToken = async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refreshToken;

	if (!refreshToken) {
		res.status(401).json({ message: " RefreshToken does not exist" });
		return;
	}

	try {
		const payload = jwt.verify(refreshToken, secretKey) as {
			id: string;
			email: string;
			username: string;
		};

		const newToken = jwt.sign(
			{
				id: payload.id,
				email: payload.email,
				username: payload.username,
			},
			secretKey,
			{ expiresIn: "1h" }
		);
	} catch (error) {
		res.status(401).json({ message: "Invalid refresh token" });
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
		res.json({user,message: "User found"});
		return;
	} catch (error) {
		res.status(500).json({ message: "An error occurred", error });
		return;
	}
};

export const getUsers = async (req: Request, res: Response) => {
	try {
		const users = await User.find().select("-password");
		res.json({users,message: "Users found"});
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

export const logout = async (req: Request, res: Response) => {
	try {
		console.log(req.body, "nice");
		res.clearCookie("refreshToken", { httpOnly: true });
		res.clearCookie("accessToken", { httpOnly: true });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Error during logout:", error);
		res.status(500).json({ message: "Failed to log out", error });
	}
};
