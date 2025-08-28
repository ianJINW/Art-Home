import React, { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import useAuthStore from "@/stores/auth.store";
import { useParams } from "react-router-dom";
import { GetData } from "@/utils/api";

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

	const { data, error, isError } = GetData(`/chat/${roomId}`);

	useEffect(() => {
		const socket = io(import.meta.env.VITE_API_SOCKET_URL as string, {
			transports: ["websocket"],
			auth: { token: accessToken },
			secure: true,
		});

		console.log("Socket connected:", socket.connected, data);

		socketRef.current = socket;

		let participants: string[] = [];

		if (
			data &&
			Array.isArray(data.messages) &&
			data.messages.length > 0 &&
			data.messages[0]?.chatRoom
		) {
			participants = data.messages[0].chatRoom.participants;
		}

		if (roomId) {
			socket.emit("joinRoom", roomId, participants);
			console.log(`User ${user?.username} joined room: ${roomId}`);
		}

		socket.on("chat message", (message: Message) => {
			console.log("New chat message received:", message);

			setMessages((prev) => [...prev, message]);
		});

		socket.on("roomJoined", (roomId: string) => {
			console.log(`User ${user?.username} joined room: ${roomId}`);
		});

		return () => {
			if (roomId) socket.emit("leaveRoom", roomId);
			socket.off("chat message");
			socket.off("roomJoined");
			socket.disconnect();
		};
	}, [accessToken, roomId, user, data]);

	useEffect(() => {
		if (!roomId) return;

		if (data?.messages && Array.isArray(data.messages)) {
			setMessages(data.messages as Message[]);
		}
	}, [roomId, data]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = useCallback(
		async (message: string) => {
			if (!roomId || !socketRef.current) return;
			try {
				socketRef.current.emit("chat message", {
					message,
					roomId,
					sender: user,
				});
			} catch (e) {
				console.error(e);
			}
		},
		[roomId, user]
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
				{isError && (
					<div className="text-red-500">
						{error?.message || `An error occurred while fetching chat data.`}
					</div>
				)}
				{messages.map((msg) => {
					const isMe = msg.sender?._id === user?._id;
					const align = isMe
						? "justify-end items-end"
						: "justify-start items-start";
					const tail = isMe
						? 'before:content-[""] before:absolute before:bottom-0 before:right-0 before:w-3 before:h-3 before:bg-blue-500 before:translate-x-2 before:translate-y-1 before:rounded-tl-md'
						: 'before:content-[""] before:absolute before:bottom-0 before:left-0 before:w-3 before:h-3 before:bg-gray-200 before:-translate-x-2 before:translate-y-1 before:rounded-tr-md';
					return (
						<div key={msg._id} className={`relative flex ${align}`}>
							<div
								className={`w-fit max-w-[60dvw] p-4 rounded-lg ${
									isMe ? "bg-blue-500 text-white" : "bg-gray-200"
								} ${tail}`}
							>
								<div className="font-semibold mb-1">{msg.sender?.username}</div>
								<div>{msg.content}</div>
								<div className="text-xs text-gray-600 mt-1 text-right">
									{new Date(msg.timestamp).toLocaleTimeString()}
								</div>
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
				<input
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
