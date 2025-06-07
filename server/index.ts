import express from "express";
import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import http from "http";
import cookieParser from "cookie-parser";
import OpenAI from "openai";

import connectDB from "./config/db";
import userRouter from "./routes/userRoutes";
import artRouter from "./routes/artRoutes";
import chatRouter from "./routes/chatRoutes";
import artistRouter from "./routes/artistRoutes";
import { initializeSocket } from "./socket/chat";
import { authToken } from "./utils/jwt";
import "./config/passport";

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

/*
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	(async () => {
	const res = await client.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "system",
				content:
					"You are a helpful assistant that helps users with their queries.",
			},
			{
				role: "user",
				content: "What is the capital of France?",
			},
		],
	});
	console.log(res.choices[0].message.content);
})();*/

connectDB();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/v1/user", userRouter);
app.use(authToken);
app.use("/api/v1/art", artRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/artist", artistRouter);

initializeSocket(server);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export default app;
