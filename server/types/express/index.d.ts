import { AuthenticatedUser } from "../../controllers/chatController";

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
	}
}
