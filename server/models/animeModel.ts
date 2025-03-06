import mongoose from "mongoose";

const animeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  episodes: {
    type: [String],
  },
  songs: {
    type: String,
  },
  genre: {
    type: String,
    required: true,
  },
  characters: {
    type: String,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const animeModel = mongoose.model("Anime", animeSchema);

export default animeModel;
