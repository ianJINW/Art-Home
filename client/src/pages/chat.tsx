import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuthStore from "@/stores/auth.store";
import api from "@/utils/axios";

interface Message {
  sender: string;
  message: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  interface User {
    id: string;
  }

  const user = useAuthStore((state) => {
    const currentUser = state.user;
    return currentUser && 'id' in currentUser ? (currentUser as User) : null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await api.get(`/chat/${roomId}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    if (roomId) {
      fetchChatHistory();
    }
  }, [roomId]);

  // Send a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const newMessage = {
        roomId,
        senderId: user?.id,
        message: input,
      };

      const response = await api.post(`/chat/${roomId}`, newMessage);
      setMessages(response.data.updatedRoom.messages);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Room</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.sender}:</strong> {msg.message}{" "}
            <span className="text-sm text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;