import React, { useEffect } from "react";
import AuthStore from "@/stores/auth.store";
import { GetData } from "@/utils/api";
import { AlertCircle, Loader2 } from "lucide-react";

const Gallery: React.FC = () => {
  const user = AuthStore((state) => state.user);

  const { data, isPending, isError, error } = GetData("art");

  useEffect(() => {
    if (isError) {
      console.error("Failed to load gallery:", error);
    }
  }, [isError, error]);

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="ml-4 text-gray-600 text-lg">Loading gallery...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AlertCircle className="text-red-500" size={40} />
        <p className="ml-4 text-red-500 text-lg">
          Failed to load gallery. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-bold">Art-Home</h1>
        <p className="ml-4 text-gray-600">Welcome {user?.username}</p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(data) &&
          data.map((piece) => (
            <div
              key={piece.id}
              className="border border-gray-300 rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
            >
              <img
                src={piece.image}
                alt={piece.title}
                className="w-full h-auto rounded-md"
              />
              <div className="mt-4">
                <h2 className="text-lg font-semibold">{piece.artist}</h2>
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  {user?.username}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Gallery;