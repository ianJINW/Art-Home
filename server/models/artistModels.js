"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ArtistSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    bio: { type: String, required: true },
    works: { type: mongoose_1.Schema.Types.ObjectId, ref: "Art" },
    socials: { type: [String], required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
});
const Artist = (0, mongoose_1.model)("Artist", ArtistSchema);
exports.default = Artist;
