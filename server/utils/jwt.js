"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        res.sendStatus(401);
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        req.user = user;
        next();
    });
};
exports.authToken = authToken;
