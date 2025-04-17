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
    <div className="max-w-7xl mx-auto p-4">
      <Header username={user?.username} />
      <GalleryGrid galleryData={galleryData?.artPieces || []} />
      <ArtistList artistData={artistData?.data || []} />
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
  <div className="flex items-center justify-center text-center mb-8">
    <h1 className="text-3xl font-bold text-orange-500 dark:text-blue-400">
      Art Gallery
    </h1>
    <p className="ml-4 text-gray-600 dark:text-gray-300">
      {username ? `Welcome, ${username}!` : "Explore amazing art pieces."}
    </p>
  </div>
);

const GalleryGrid: React.FC<{
  galleryData: { id: string; art: string; title: string; artist: string }[];
}> = ({ galleryData }) => (
  <div className="grid grid-cols-1 align-middle space-x-0 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {galleryData.map((piece) => (
      <div
        key={piece.id}
        className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
      >
        <img
          src={piece.art}
          alt={piece.title}
          className="w-full h-48 object-cover rounded-md"
        />
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {piece.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            By {piece.artist}
          </p>
          <button className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
            {piece.artist}
          </button>
        </div>
      </div>
    ))}
  </div>
);

const ArtistList: React.FC<{
  artistData: { id: string; name: string }[];
}> = ({ artistData }) => (
  <div className="mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
      Featured Artists
    </h2>
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {artistData.map((artist) => (
        <li
          key={artist.id}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <img
            src="/default-avatar.png"
            alt={artist.name}
            className="w-16 h-16 rounded-full border-2 border-orange-500 dark:border-blue-400 object-cover"
          />
          <p className="text-gray-800 dark:text-gray-200 font-medium">
            {artist.name}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

export default Gallery;