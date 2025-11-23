"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const artController_1 = __importDefault(require("../controllers/artController"));
const multer_1 = __importDefault(require("../middleware/multer"));
const validator_1 = require("../middleware/validator");
const router = (0, express_1.Router)();
router
    .route("/")
    .get(artController_1.default.getAllArt)
    .post(validator_1.validateObjectId, multer_1.default.single("art"), validator_1.validateArtFields, artController_1.default.createArt);
router
    .route("/:id")
    .get(artController_1.default.getArtById)
    .put(multer_1.default.single("art"), artController_1.default.updateArt);
router
    .route("/:id/like")
    .post(artController_1.default.likeArt)
    .delete(artController_1.default.unlikeArt);
router
    .route("/:id/comment")
    .post(artController_1.default.addComment)
    .delete(artController_1.default.deleteComment);
exports.default = router;
