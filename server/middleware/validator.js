"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArtFields = exports.validateObjectId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid ID format" });
        return;
    }
    next();
};
exports.validateObjectId = validateObjectId;
const validateArtFields = (req, res, next) => {
    const { title, artist, description } = req.body;
    if (!title || !artist || !description) {
        res
            .status(400)
            .json({ message: "Title, artist, and description are required" });
        return;
    }
    next();
};
exports.validateArtFields = validateArtFields;
