import mongoose from "mongoose";
import bcrypt from "bcryptjs";


export interface IUser extends Document {
	username: string;
	email: string;
	password: string;
	isAdmin: boolean;
	image: string;
	refreshTokens: string[];
	comparePassword(candidatePassword: string): Promise<boolean>;
}

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
	refreshTokens: { type: Array, default: [] },
});

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
		console.log("Hashed Password:", this.password); // Debugging
	}
	next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
	console.log("Comparing password:", candidatePassword, "with hash:", this.password); // Debugging
	return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
