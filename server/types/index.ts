import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  error: boolean;
  data?: T
  message?: string

}