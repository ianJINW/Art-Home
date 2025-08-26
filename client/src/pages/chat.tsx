interface Message {
	_id: string;
	sender: {
		_id: string;
		username: string;
	};
	title: string;
	content: string;
	timestamp: string;
}

import useAuthStore from "@/stores/auth.store";
import api from "@/utils/axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import io from "socket.io-client";

const Chat: React.FC = () => {
	const { user, accessToken } = useAuthStore();
	const { id: roomId } = useParams<{ id: string }>();

	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const messagesRef = useRef<Message[]>([]);

	const backendUrl = import.meta.env.VITE_SOCKET_URL;

	const socket = io(backendUrl, {
		transports: ["websocket"],
		auth: { token: accessToken },
		secure: true,
	});

	socket.on("connect", () => {
		console.log("Connected to socket server");
	});

	socket.on("disconnect", () => {
		console.log("Disconnected from socket server");
	});

/* 	socket.on("connect_error", (err: unknown) => {
		console.error("Connection error:", err);
	}); */

	useEffect(() => {
		socket.on("chat message", (message: Message) => {
			setMessages((prev) => [...prev, message]);
		});

		return () => {
			socket.off("chat message");
		};
	}, [socket]);

	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	useEffect(() => {
		if (!roomId) return;
		(async () => {
			try {
				const res = await api.get(`/chat/${roomId}`);

		

				setMessages(res.data.messages || []);
			} catch (error) {
				console.error("Error fetching chat messages:", error);
			}
		})();
	}, [roomId]);

	const sendMessage = useCallback(
		async (content: string) => {
			try {
				const message = {
					id: crypto.randomUUID(),
					title: "New Message",
					content,
				};

				const res = await api.post(`/chat/${roomId}/messages`, message);
				const newMessage = res.data.message;
				setMessages((prev) => [...prev, newMessage]);
			} catch (error) {
				console.error("Error sending chat message:", error);
			}
		},
		[roomId]
	);

	const sendMessageHandler = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (inputValue.trim()) {
				sendMessage(inputValue);
				setInputValue("");
			}
		},
		[inputValue, sendMessage]
	);

	return (
		<main>
			<header></header>

			<section>
				{Array.isArray(messages) ? (
					messages.map((message: Message) => {
						const isMe = message.sender._id === user?.id;
						console.log(message, user);
						return (	
							<article key={message._id} className={`message${isMe ? " sent" : " received"}`}>
								<h3>
									<MessageCircle /> {message.sender?.username}
								</h3>
							<p>{message.content}</p>

							<small>{new Date(message.timestamp).toLocaleString()}</small>
						</article>
					);
				})) : (
						<p>No messages</p>
				)}
			</section>

			<form onSubmit={sendMessageHandler}>
				<input type="text" placeholder="Type your message..." />
				<button type="submit">Send</button>
			</form>
		</main>
	);
};

export default Chat;
