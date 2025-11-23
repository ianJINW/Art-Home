"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
});
const storages = multer_1.default.memoryStorage();
/* const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        public_id: (req, file) => `${Date.now()}-${file.originalname}`,
    },
}); */
const uploads = (0, multer_1.default)({
    storage: storages,
    limits: { fileSize: 10 * 1024 * 1024 },
});
exports.default = uploads;
