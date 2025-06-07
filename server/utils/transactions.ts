import { NextFunction, Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";

const transactione =
	(
		fn: (
			session: mongoose.ClientSession,
			req: Request,
			res: Response
		) => Promise<void>
	) =>
	async (req: Request, res: Response) => {
		const session = await mongoose.startSession();
		session.startTransaction();
		try {
			await fn(session, req, res);
			await session.commitTransaction();
		} catch (error) {
			await session.abortTransaction();
			res.status(500).json({ message: "Transaction failed", error });
		} finally {
			session.endSession();
		}
	};

export default transactione;
