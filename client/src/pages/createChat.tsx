import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetData } from "@/utils/api";
import api from "@/utils/axios";

interface Artist {
  _id: string;
  name: string;
}

const CreateChat: React.FC = () => {
  const { data: artists, isPending, isError, error } = GetData<Artist[]>("/artist");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [roomName, setRoomName] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle form submission
  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedParticipants.length === 0) {
      setFormError("Please select at least one participant.");
      return;
    }

    try {
      const response = await api.post("/chat", {
        participants: selectedParticipants,
        roomName: roomName || undefined,
      });

      console.log("Chat room created:", response.data.chatRoom);
      navigate("/chats"); // Redirect to the chats page
    } catch (error) {
      console.error("Error creating chat room:", error);
      setFormError("Failed to create chat room. Please try again.");
    }
  };

  // Handle participant selection
  const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedParticipants(selectedOptions);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Create a New Chat Room</h1>
      <form onSubmit={handleCreateChat} className="space-y-6">
        {/* Participants Dropdown */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Select Participants
          </label>
          {isPending ? (
            <p className="text-gray-500">Loading artists...</p>
          ) : isError ? (
            <p className="text-red-500">{error?.message || "Failed to load artists."}</p>
          ) : (
            <select
              multiple
              value={selectedParticipants}
              onChange={handleParticipantChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.isArray(artists) &&
                artists.map((artist) => (
                  <option key={artist._id} value={artist._id}>
                    {artist.name} - {artist.bio} {/* Display artist name and bio */}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Room Name Input */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Room Name (optional)</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter a room name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error Message */}
        {formError && <p className="text-red-500 text-center">{formError}</p>}

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Chat Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChat;