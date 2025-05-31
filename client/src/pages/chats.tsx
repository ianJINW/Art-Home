import React from "react";
import { MessageCircle } from "lucide-react";
import { GetData } from "@/utils/api";
import { Link } from "react-router-dom";

interface Participant {
  username: string;
}

interface ChatRoom {
  _id: string;
  chatId: string;
  participants: Participant[];
}

const Chats: React.FC = () => {
  const { data: chats, isPending, isError, error } = GetData(`/chat`);

  // Render loading state
  if (isPending) {
    return <div className="text-center text-gray-500">Loading chats...</div>;
  }

  // Render error state
  if (isError) {
    return (
      <div className="text-center text-red-500">
        Error: {error?.message || "Failed to load chats."}
      </div>
    );
  }

  // Render empty state
  if (!chats || !Array.isArray(chats.chatRooms) || chats.chatRooms.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Chats Available</h1>
        <p className="text-gray-600 mb-4">
          You don't have any active chats. Start a new conversation now!
        </p>
        <Link
          to="/create-chat"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create a New Chat
        </Link>
      </div>
    );
  }

  // Render chat list
  return (
    <div className="max-w-md mx-auto p-4">
      <Link
        to="/create-chat"
        className="flex items-center bg-blue-500 text-black rounded-md shadow hover:shadow-md transition-shadow p-4 mb-4"
      >
        <MessageCircle size={20} className="text-black" />
        <h4 className="text-md text-black">New Chat</h4>
      </Link>

      <h1 className="text-2xl font-bold mb-4">Chats</h1>
      <ul className="space-y-4">
        {chats.chatRooms.map((chat: ChatRoom) => (
          <li
            key={chat._id}
            className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <MessageCircle size={20} />
            <Link
              to={`/chat/${chat.chatId}`}
              className="text-blue-500 hover:underline"
            >
              {chat.chatId}            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chats;