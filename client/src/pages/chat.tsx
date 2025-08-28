import React, { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import useAuthStore from "@/stores/auth.store";
import { useParams } from "react-router-dom";
import { GetData, PostData } from "@/utils/api";
import { XCircle } from "lucide-react";

interface Message {
  _id: string;
  sender?: { _id: string; username: string };
  content: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  const { user, accessToken } = useAuthStore();
  const { id: roomId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const socketRef = useRef<typeof Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { mutate, isError, error } = PostData(`/chat/${roomId}`);
  const { data: chatData, error: chatError, isError: chatIsError } = GetData(`/chat/${roomId}`);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_SOCKET_URL as string, {
      transports: ["websocket"],
      auth: { token: accessToken },
      secure: true,
    });

    socketRef.current = socket;

    socket.on("chat message", (message: Message) => {

      console.log("New chat message received:", message);

      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket.off("chat message");
      socket.disconnect();
    };
  }, [accessToken]);

  useEffect(() => {
    if (!roomId) return;

    if (chatData?.messages && Array.isArray(chatData.messages)) {
      setMessages(chatData.messages as Message[]);
    }

  }, [roomId, chatData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!roomId || !socketRef.current) return;
      try {
        await mutate({ message: inputValue, chatId: roomId })
        socketRef.current.emit("chatmessage", { message, chatRoom: roomId });
      } catch (e) {
        console.error(e);

      }
    },
    [roomId, mutate, inputValue]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };


  return (
    <main className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <section className="flex-1 overflow-y-auto p-4 space-y-2 h-[calc(100vh-200px)]">
        {chatIsError && (
          <div className="text-red-500">

            {chatError?.message || `An error occurred while fetching chat data.`}
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender?._id === user?._id;
          const align = isMe ? 'justify-end items-end' : 'justify-start items-start';
          const tail = isMe ? 'before:content-[""] before:absolute before:bottom-0 before:right-0 before:w-3 before:h-3 before:bg-blue-500 before:translate-x-2 before:translate-y-1 before:rounded-tl-md' :
            'before:content-[""] before:absolute before:bottom-0 before:left-0 before:w-3 before:h-3 before:bg-gray-200 before:-translate-x-2 before:translate-y-1 before:rounded-tr-md';
          return (
            <div key={msg._id} className={`relative flex ${align}`}>
              <div className={`w-fit max-w-[60dvw] p-4 rounded-lg ${isMe ? "bg-blue-500 text-white" : "bg-gray-200"} ${tail}`}>
                <div className="font-semibold mb-1">{msg.sender?.username}</div>
                <div>{msg.content}</div>
                <div className="text-xs text-gray-600 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </section>

      <form
        onSubmit={handleSubmit}
        className="flex p-4 border-t bg-white dark:bg-gray-800"
      >
        {isError && (
          <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <XCircle className="mr-2" size={20} />
            <span className="block flex-1">{error?.message}</span>

          </div>
        )}        <input
          type="text"
          className="flex-1 p-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
          placeholder="Type your message…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={!inputValue.trim()}
        >
          Send
        </button>
      </form>
    </main>
  );
};

export default Chat;
