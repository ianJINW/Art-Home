import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetData } from "@/utils/api";
import api from "@/utils/axios";
import useAuthStore from "@/stores/auth.store";

const CreateChat: React.FC = () => {
  // Fetch artists data from the API
  const { data: artists, isPending, isError, error } = GetData("/artist");

  // State for selected participants, room name, and form error
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [roomName, setRoomName] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Get the logged-in user's ID from the auth store
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  // Navigation hook to redirect after creating a chat
  const navigate = useNavigate();

  // Handle form submission to create a new chat room
  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one participant is selected
    if (selectedParticipants.length === 0) {
      setFormError("Please select at least one participant.");
      return;
    }

    try {
      const participants = [...selectedParticipants, String(userId)];

      // Send the request to create a chat room
      const response = await api.post("/chat", {
        participants,
        roomName,
      });

      console.log("Chat room created:", response.data.chatRoom);
      navigate(`/chat/${Number(response.data.chatRoom._id)}`, {
        state: {
          roomId: response.data.chatRoom.roomId,
          participants: response.data.chatRoom.participants,
        },
      });
    } catch (error: any) {
      console.error("Error creating chat room:", error);
      if (error.response) {
        setFormError(error.response.data.error || "Failed to create chat room. Please try again.");
      } else {
        setFormError("Failed to create chat room. Please try again.");
      }
    }
  };

  // Handle participant selection from the dropdown
  const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    console.log("Selected participants:", selectedOptions);
    setSelectedParticipants(selectedOptions);
    setRoomName(e.target.textContent || "");
    setFormError(null);
  };

  return (
    <div className="flex justify-center flex-col items-center w-auto bg-gray-100 dark:bg-gray-900 border border-gray-300 rounded-sm shadow-sm m-2 p-2">
      <h3 className="font-bold text-center mb-2 text-beige">Create a New Chat Room</h3>
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
              {Array.isArray(artists?.data) &&
                artists.data.map((artist) => (
                  <option key={artist._id} value={artist._id} className="text-black dark:text-black">
                    {artist.name}
                  </option>
                ))}
            </select>
          )}
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