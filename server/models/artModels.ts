import { Schema, model, Document } from "mongoose";

interface IArt extends Document {
	title: string;
	artist: string;
	art: string;
	description?: string;
}

const ArtSchema: Schema = new Schema({
	title: { type: String, required: true },
	artist: { type: String, required: true },
	art: { type: String, required: true },
	description: { type: String },
});

const Art = model<IArt>("Art", ArtSchema);

export default Art;
