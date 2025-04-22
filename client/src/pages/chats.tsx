import React from "react";
import { MessageCircle } from "lucide-react";
import { GetData } from "@/utils/api";
import { Link } from "react-router-dom";

interface Participant {
  username: string;
}

const Chats: React.FC = () => {
  const { data, isPending, isError, error } = GetData(`chat`);

  if (isPending) {
    return <div>Loading chats...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message || "Failed to load chats."}</div>;
  }

  if (!data || data.length === 0) {
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chats</h1>
      <ul className="space-y-4">
        {Array.isArray(data) &&
          data.map((chat) => (
            <li
              key={chat._id}
              className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <MessageCircle size={20} />
              <Link
                to={`/chat/${chat.roomId}`}
                className="text-blue-500 hover:underline"
              >
                {chat.participants.map((p: Participant) => p.username).join(", ")}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Chats;