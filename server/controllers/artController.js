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
const artModels_1 = __importDefault(require("../models/artModels"));
const multer_1 = require("../middleware/multer");
const transactions_1 = __importDefault(require("../utils/transactions"));
class ArtController {
    constructor() {
        this.createArt = (session, req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user /*|| !req.user.isArtist */) {
                res.status(403).json({ message: "Only artists can create art" });
                return;
            }
            if (!req.file) {
                res.status(400).json({ message: "Please upload an image" });
                return;
            }
            try {
                const { artist, description, title } = req.body;
                const file = req.file;
                if (!file || !artist || !title) {
                    res.status(400).json({ message: "Please provide all required fields" });
                    return;
                }
                const imageURL = yield new Promise((resolve, reject) => {
                    multer_1.cloudinary.uploader
                        .upload_stream({ upload_preset: "art-gallery" }, (error, result) => {
                        if (result)
                            resolve(result.secure_url);
                        else
                            reject(error);
                    })
                        .end(file.buffer);
                });
                const newArt = new artModels_1.default({
                    art: imageURL,
                    artist,
                    description,
                    title,
                });
                yield newArt.save({ session });
                res.status(201).json({ message: "Art piece created", art: newArt });
            }
            catch (error) {
                console.error("Error creating art piece:", error.stack);
                res
                    .status(500)
                    .json({ message: "Error creating art piece", error: error.message });
            }
        });
    }
    getAllArt(session, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 20 } = req.query;
                const artPieces = yield artModels_1.default.find()
                    .populate("user")
                    .sort({ createdAt: -1 })
                    .skip((Number(page) - 1) * Number(limit))
                    .limit(Number(limit));
                res
                    .status(200)
                    .json({ message: "All art pieces", artPieces, page, limit });
            }
            catch (error) {
                console.error("Error fetching art pieces:", error.stack);
                res
                    .status(500)
                    .json({ message: "Error fetching art pieces", error: error.message });
            }
        });
    }
    getArtById(session, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const artId = req.params.id;
                const artPiece = yield artModels_1.default.findById(artId)
                    .populate("user")
                    .populate("likes");
                if (!artPiece) {
                    res
                        .status(404)
                        .json({ message: `Art piece with id ${artId} not found` });
                    return;
                }
                res.status(200).json({ message: `Art piece with id ${artId}`, artPiece });
            }
            catch (error) {
                console.error("Error fetching art piece:", error.stack);
                res
                    .status(500)
                    .json({ message: "Error fetching art piece", error: error.message });
            }
        });
    }
    likeArt(session, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const userId = req.body.userId;
            try {
                let artPiece = yield artModels_1.default.findById(id, { session });
                if (!artPiece) {
                    res.status(404).json({ message: `Art piece with id ${id} not found` });
                    return;
                }
                const like = {
                    userId: userId,
                    liked: true,
                    createdAt: new Date(),
                };
                artPiece.likes.push(like);
                yield artPiece.save({ session });
                res
                    .status(200)
                    .json({ message: `Art piece with id ${id} liked`, artPiece });
            }
            catch (error) {
                console.error("Error liking art piece:", error.stack);
                res
                    .status(500)
                    .json({ message: "Error liking art piece", error: error.message });
            }
        });
    }
    unlikeArt(session, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const userId = req.body.userId;
            let likes = [];
            try {
                const artPiece = yield artModels_1.default.findById(id, { session });
                if (!artPiece) {
                    res.status(404).json({ message: `Art piece with id ${id} not found` });
                    return;
                }
                likes = artPiece.likes.filter((like) => like.user.toString() !== userId);
                artPiece.likes = likes;
                yield artPiece.save({ session });
                res
                    .status(200)
                    .json({ message: `Art piece with id ${id} unliked`, artPiece });
            }
            catch (error) {
                console.error("Error unliking art piece:", error.stack);
                res
                    .status(500)
                    .json({ message: "Error unliking art piece", error: error.message });
            }
        });
    }
    addComment(session, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const userId = req.body.userId;
            const content = req.body.content;
            const comments = [];
            try {
                const artPiece = yield artModels_1.default.findById(id);
                if (!artPiece) {
                    res.status(404).json({ message: `Art piece with id ${id} not found` });
                    return;
                }
                const comment = {
                    userId: userId,
                    content: content,
                    createdAt: new Date(),
                };
                comments.push(comment);
                artPiece.comments = comments;
                res.status(200).json({
                    message: `Comment added to art piece with id ${id}`,
                    artPiece,
                });
            }
            catch (error) {
                console.error("Error adding comment to art piece:", error.stack);
                res.status(500).json({
                    message: "Error adding comment to art piece",
                    error: error.message,
                });
            }
        });
    }
    deleteComment(session, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const userId = req.body.userId;
            let comments = [];
            try {
                const artPiece = yield artModels_1.default.findById(id, { session });
                if (!artPiece) {
                    res.status(404).json({ message: `Art piece with id ${id} not found` });
                    return;
                }
                comments = artPiece.comments.filter((comment) => comment.userId.toString() !== userId);
                artPiece.comments = comments;
                yield artPiece.save({ session });
                res.status(200).json({
                    message: `Comment deleted from art piece with id ${id}`,
                    artPiece,
                });
            }
            catch (error) {
                console.error("Error deleting comment from art piece:", error.stack);
                res.status(500).json({
                    message: "Error deleting comment from art piece",
                    error: error.message,
                });
            }
        });
    }
    updateArt(session, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const artId = req.params.id;
                const { artist, description, title } = req.body;
                const art = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
                const artPiece = yield artModels_1.default.findById(artId, { session })
                    .populate("likes")
                    .populate("comments")
                    .populate("artist");
                if (!artPiece) {
                    res
                        .status(404)
                        .json({ message: `Art piece with id ${artId} not found` });
                    return;
                }
                const updatedArt = yield artModels_1.default.findByIdAndUpdate(artId, {
                    art: art || artPiece.art,
                    artist: artist || artPiece.artist,
                    description: description || artPiece.description,
                    title: title || artPiece.title,
                }, { new: true, session });
                res.status(200).json({
                    message: `Art piece with id ${artId} updated`,
                    art: updatedArt,
                });
            }
            catch (error) {
                console.error("Error updating art piece:", error.stack);
                res
                    .status(500)
                    .json({ message: "Error updating art piece", error: error.message });
            }
        });
    }
    deleteArt(session, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const artId = req.params.id;
                const artPiece = yield artModels_1.default.findById(artId);
                if (!artPiece) {
                    res
                        .status(404)
                        .json({ message: `Art piece with id ${artId} not found` });
                    return;
                }
                yield artModels_1.default.findByIdAndDelete(artId, { session });
                res
                    .status(200)
                    .json({ message: `Art piece with id ${artId} deleted`, artPiece });
            }
            catch (error) {
                console.error("Error deleting art piece:", error.stack);
                res
                    .status(500)
                    .json({ message: "Error deleting art piece", error: error.message });
            }
        });
    }
}
exports.default = {
    getAllArt: (0, transactions_1.default)(ArtController.prototype.getAllArt),
    getArtById: (0, transactions_1.default)(ArtController.prototype.getArtById),
    likeArt: (0, transactions_1.default)(ArtController.prototype.likeArt),
    unlikeArt: (0, transactions_1.default)(ArtController.prototype.unlikeArt),
    addComment: (0, transactions_1.default)(ArtController.prototype.addComment),
    deleteComment: (0, transactions_1.default)(ArtController.prototype.deleteComment),
    createArt: (0, transactions_1.default)(ArtController.prototype.createArt),
    updateArt: (0, transactions_1.default)(ArtController.prototype.updateArt),
    deleteArt: (0, transactions_1.default)(ArtController.prototype.deleteArt),
};
