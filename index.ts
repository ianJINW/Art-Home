import express from "express";
import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import helmet from "helmet";
import passport from "passport";

import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";

const app = express();
const frontend = process.env.FRONTEND_URL;
const PORT = process.env.PORT;

app.use(
	cors({
		origin: frontend,
		credentials: true,
	})
);

connectDB();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use("/api/v1", userRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
