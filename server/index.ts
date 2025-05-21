import express from "express";
import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import http from "http";
import cookieParser from "cookie-parser";

import connectDB from "./config/db";
import userRouter from "./routes/userRoutes";
import artRouter from "./routes/artRoutes";
import chatRouter from "./routes/chatRoutes";
import artistRouter from "./routes/artistRoutes";
import { initializeSocket } from "./socket/chat";

const app = express();
const frontend = process.env.FRONTEND_URL;
const PORT = process.env.PORT;

const server = http.createServer(app);

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
app.use(cookieParser());

app.use(passport.initialize());
import "./config/passport";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/art", artRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/artist", artistRouter);

initializeSocket(server);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
