import { model, Schema } from "mongoose";

interface IArtist {
	name: string;
	bio: string;
	art: string;
	socials: Array<string>;
}

const ArtistSchema: Schema = new Schema({
	name: { type: String, required: true },
	bio: { type: String, required: true },
	works: { type: Schema.Types.ObjectId, ref: "Art" },
	socials: { type: [String], required: true },
});

const Artist = model<IArtist>("Artist", ArtistSchema);

export default Artist;
