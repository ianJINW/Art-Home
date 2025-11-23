"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userModels_1 = __importDefault(require("./userModels"));
const LikeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    liked: { type: Boolean, default: false },
});
const commentSchema = new mongoose_1.Schema({
    content: { type: String, required: true, trim: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
});
const ArtSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true, unique: true },
    artistId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    art: { type: String, required: true },
    description: { type: String, trim: true },
    likes: [LikeSchema],
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
commentSchema.index({ createdAt: -1 });
ArtSchema.index({ createdAt: -1, updatedAt: -1, author: 1 });
ArtSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userModels_1.default.findById(this.artistId);
        if (!user) {
            throw new Error("Only artists can post artworks");
        }
        next();
    });
});
const Art = (0, mongoose_1.model)("Art", ArtSchema);
exports.default = Art;
