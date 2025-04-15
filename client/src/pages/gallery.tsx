import React, { useEffect } from "react";
import AuthStore from "@/stores/auth.store";
import { GetData } from "@/utils/api";
import { AlertCircle, Loader2 } from "lucide-react";

const Gallery: React.FC = () => {
  const user = AuthStore((state) => state.user);

  const {
    data: galleryData,
    isPending: isGalleryPending,
    isError: isGalleryError,
    error: galleryError,
  } = GetData("art");

  const {
    data: artistData,
    isPending: isArtistPending,
    isError: isArtistError,
    error: artistError,
  } = GetData("artist");

  useEffect(() => {
    if (isGalleryError) console.error("Failed to load gallery:", galleryError);
    if (isArtistError) console.error("Failed to load artist data:", artistError);
  }, [isGalleryError, galleryError, isArtistError, artistError]);

  if (isGalleryPending || isArtistPending) {
    return <LoadingScreen />;
  }

  if (isGalleryError || isArtistError) {
    return <ErrorScreen />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Header username={user?.username} />
      <GalleryGrid galleryData={galleryData} username={user?.username} />
      <ArtistList artistData={artistData} />
    </div>
  );
};

const LoadingScreen: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader2 className="animate-spin text-blue-500" size={40} />
    <p className="ml-4 text-gray-600 text-lg">Loading...</p>
  </div>
);

const ErrorScreen: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen">
    <AlertCircle className="text-red-500" size={40} />
    <p className="ml-4 text-red-500 text-lg">
      Failed to load data. Please try again later.
    </p>
  </div>
);

const Header: React.FC<{ username?: string }> = ({ username }) => (
  <div className="flex items-center mb-8">
    <h1 className="text-2xl font-bold">Art-Home</h1>
    <p className="ml-4 text-gray-600">Welcome {username}</p>
  </div>
);

const GalleryGrid: React.FC<{
  galleryData?: { artPieces: { id: string; art: string; title: string; artist: string }[] };
  username?: string;
}> = ({ galleryData }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.isArray(galleryData?.artPieces) &&
      galleryData.artPieces.map((piece) => (
        <div
          key={piece.id}
          className="border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
        >
          <img
            src={piece.art}
            alt={piece.title}
            className="w-full h-auto rounded-md"
          />

          <div className="mt-4">
            <h2 className="text-lg font-semibold">{piece.artist}</h2>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              {piece.artist.name}
            </button>
          </div>
        </div>
      ))}
  </div>
);

const ArtistList: React.FC<{
  artistData?: { artists: { id: string; name: string }[] };
}> = ({ artistData }) => (
  <div className="mt-8">
    <h2 className="text-xl font-bold">Artists</h2>
    <ul className="list-disc pl-5">
      {Array.isArray(artistData?.artists) &&
        artistData.artists.map((artist) => (
          <li key={artist.id} className="text-gray-700">
            {artist.name}
            <img
              src="/default-avatar.png"
              alt={artist.name}
              className="w-16 h-16 rounded-full ml-2" />
          </li>
        ))}
    </ul>
  </div>
);

export default Gallery;