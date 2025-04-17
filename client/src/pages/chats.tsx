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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-orange-500 text-lg">Loading chats...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-lg">
          Error: {error?.message || "Failed to load chats."}
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">No chats available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-orange-500 dark:text-blue-400">
        Chats
      </h1>
      <ul className="space-y-4">
        {Array.isArray(data) &&
          data.map((chat) => (
            <li
              key={chat._id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <MessageCircle
                size={24}
                className="text-orange-500 dark:text-blue-400"
              />
              <Link
                to={`/chat/${chat.roomId}`}
                className="text-gray-700 dark:text-gray-300 hover:underline"
              >
                {chat.participants
                  .map((p: Participant) => p.username)
                  .join(", ")}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Chats;