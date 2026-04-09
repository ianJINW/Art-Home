import passport from "passport";
import { Request } from "express";
import {
	ExtractJwt,
	StrategyOptions,
	Strategy as JwtStrategy,
} from "passport-jwt";

import User, { IUser } from "../models/userModels";
import { JWTPayload } from "../controllers/userController";

const opts: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET as string,
	passReqToCallback: true,
};

passport.use(
	new JwtStrategy(opts, async (req: Request, payload: JWTPayload, done: (err: any, user?: IUser | false) => void) => {
		try {
			const user: IUser | null = await User.findById(payload.id);

			if (user) return done(null, user);

			return done(null, false);
		} catch (err) {
			return done(err, false);
		}
	})
);

export default passport;
