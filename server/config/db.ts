import mongoose from "mongoose";

declare global {
	var mongooseCache: {
		conn: typeof mongoose | null;
		promise: Promise<typeof mongoose | null> | null;
	};
}

const mongoURI = process.env.MONGO_URI as string;

if (!mongoURI)
	throw new Error("MONGO_URI not defined in environment variables");

const opts = {
	bufferCommands: false,
	maxPoolSize: 10,
	minPoolSize: 1,
	serverSelectionTimeoutMS: 5000,
};

let cached = global.mongooseCache;

if (!cached) {
	cached = global.mongooseCache = {
		conn: null,
		promise: null,
	};
	cached = global.mongooseCache;
}

const connectDB = async () => {
	try {
		if (cached.conn) return cached.conn;

		if (!cached.promise) {
			cached.promise = mongoose.connect(mongoURI, opts);
		}
		const conn = await cached.promise;
		console.log(`MongoDB Connected: ${conn?.connection.host}`);
	} catch (err: any) {
		console.error(`Error: ${err.message}`);
		process.exit(1);
	}
};

export default connectDB;
