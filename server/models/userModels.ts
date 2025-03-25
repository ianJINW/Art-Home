import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		required: true,
		default: false,
	},
	image: {
		type: String,
		default: "",
	},
	refrechTokens: { type: Array, default: [] },
});

const User = mongoose.model("User", userSchema);

export default User;
