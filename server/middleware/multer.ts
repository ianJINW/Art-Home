import multer, { memoryStorage } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
	api_key: process.env.CLOUDINARY_API_KEY || "",
	api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export { cloudinary };

const storages = multer.memoryStorage();
/* const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		public_id: (req, file) => `${Date.now()}-${file.originalname}`,
	},
}); */

const uploads = multer({
	storage: storages,
	limits: { fileSize: 10 * 1024 * 1024 },
});

export default uploads;
