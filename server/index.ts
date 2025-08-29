import express, { Request, Response, NextFunction } from "express";
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

console.log("Socket initialized 2");

app.use((req: Request, res: Response, next: NextFunction) => {
	console.log(
		`Request received: ${req.method} ${req.url} ${JSON.stringify(req.body)} ${
			req.headers
		}`
	);
	next();
});

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

console.log(`Routes initialized ${Date.now()}`);

connectDB();
initializeSocket(server);

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export default app;
