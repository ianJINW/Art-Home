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
exports.deleteArtist = exports.updateArtist = exports.getArtist = exports.getArtists = exports.createArtist = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const artistModels_1 = __importDefault(require("../models/artistModels"));
const transactions_1 = __importDefault(require("../utils/transactions"));
// Utility function for handling errors
const handleError = (res, error, statusCode = 500) => {
    res.status(statusCode).json({
        message: error.message || "An unexpected error occurred",
    });
};
// Create a new artist
const create = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, bio, socials, works, user } = req.body;
    // Validate required fields
    if (!name || !bio || !socials || !Array.isArray(socials)) {
        res.status(400).json({
            message: "Name, bio, and socials are required, and socials must be an array",
        });
        return;
    }
    // Validate and convert the user field to ObjectId
    if (!mongoose_1.default.Types.ObjectId.isValid(user)) {
        res.status(400).json({
            message: "Invalid user ID",
        });
        return;
    }
    try {
        // Create the artist
        const artist = yield artistModels_1.default.create({
            name,
            bio,
            socials,
            works: new mongoose_1.default.Types.ObjectId(works),
            user: new mongoose_1.default.Types.ObjectId(user),
        }, { session });
        res.status(201).json({
            message: "Artist created successfully",
            data: artist,
        });
    }
    catch (error) {
        // Handle errors
        handleError(res, error);
    }
});
// Get all artists
const getArtistsFn = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const artists = yield artistModels_1.default.find().populate("user");
        res.status(200).json({
            message: "Artists retrieved successfully",
            data: artists,
        });
    }
    catch (error) {
        handleError(res, error);
    }
});
// Get a single artist by ID
const getArtistFn = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            message: "Invalid artist ID",
        });
        return;
    }
    try {
        const artist = yield artistModels_1.default.findById(id).populate("works").populate("user");
        if (!artist) {
            res.status(404).json({
                message: `Artist with ID ${id} not found`,
            });
            return;
        }
        res.status(200).json({
            message: "Artist retrieved successfully",
            data: artist,
        });
    }
    catch (error) {
        handleError(res, error);
    }
});
// Update an artist by ID
const update = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, bio, socials, works } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            message: "Invalid artist ID",
        });
        return;
    }
    try {
        const artist = yield artistModels_1.default.findByIdAndUpdate(id, { name, bio, socials, works }, {
            new: true,
            runValidators: true,
            session,
        });
        if (!artist) {
            res.status(404).json({
                message: `Artist with ID ${id} not found`,
            });
            return;
        }
        res.status(200).json({
            message: "Artist updated successfully",
            data: artist,
        });
    }
    catch (error) {
        handleError(res, error);
    }
});
// Delete an artist by ID
const deleter = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            message: "Invalid artist ID",
        });
        return;
    }
    try {
        const artist = yield artistModels_1.default.findByIdAndDelete(id, { session });
        if (!artist) {
            res.status(404).json({
                message: `Artist with ID ${id} not found`,
            });
            return;
        }
        res.status(200).json({
            message: "Artist deleted successfully",
            data: artist,
        });
    }
    catch (error) {
        handleError(res, error);
    }
});
exports.createArtist = (0, transactions_1.default)(create);
exports.getArtists = (0, transactions_1.default)(getArtistsFn);
exports.getArtist = (0, transactions_1.default)(getArtistFn);
exports.updateArtist = (0, transactions_1.default)(update);
exports.deleteArtist = (0, transactions_1.default)(deleter);
