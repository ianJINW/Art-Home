"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const artistController_1 = require("../controllers/artistController");
const artistRouter = (0, express_1.Router)();
artistRouter.route("/").get(artistController_1.getArtists).post(artistController_1.createArtist);
artistRouter
    .route("/:id")
    .get(artistController_1.getArtist)
    .put(artistController_1.updateArtist)
    .delete(artistController_1.deleteArtist);
exports.default = artistRouter;
