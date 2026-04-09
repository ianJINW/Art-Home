import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModels';
import { JWTPayload } from '../controllers/userController'; // Assuming { id: string }

// Use AuthRequest from types
import type { AuthRequest } from '../types'; // Your earlier types file

export const authToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Decode & verify token (gets JWTPayload)
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;

    // Fetch plain user object (no Mongoose Document wrapper)
    const user = await User.findById(payload.id).select('-password').lean().exec();

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    (req as AuthRequest).user = {
      id: payload.id,
      email: user.email,
      role: user.isAdmin ? 'admin' : 'user',
    }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token expired or invalid' });
  }
};