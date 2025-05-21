// src/stores/chatStore.ts
import create from "zustand";
import axios from "axios";

export interface ChatMessage {
	_id: string;
	sender: string;
	message: string;
	timestamp: string;
}

interface ChatState {
	roomId: string;
	messages: ChatMessage[];
	setRoomId: (roomId: string) => void;
	setMessages: (messages: ChatMessage[]) => void;
	addMessage: (message: ChatMessage) => void;
	fetchChatHistory: () => Promise<void>;
	sendMessage: (message: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set: any, get: any) => ({
	roomId: "",
	messages: [],
	setRoomId: (roomId: string) => set({ roomId }),
	setMessages: (messages: ChatMessage[]) => set({ messages }),
	addMessage: (message: ChatMessage) =>
		set((state: any) => ({ messages: [...state.messages, message] })),
	fetchChatHistory: async () => {
		const { roomId } = get();
		if (!roomId) return;
		try {
			const response = await axios.get(`/api/chatroom/${roomId}/history`);
			set({ messages: response.data });
		} catch (error) {
			console.error("Error fetching chat history:", error);
		}
	},
	sendMessage: async (message: string) => {
		const { roomId, addMessage } = get();
		// Here, sender would usually come from an authenticated user (from a separate auth store)
		const sender = "60d0fe4f5311236168a109ca"; // example hardcoded user ID
		if (!roomId || !message) return;
		try {
			const response = await axios.post(`/api/chatroom/${roomId}/message`, {
				sender,
				message,
			});
			// Optionally, use the response or add the message locally:
			addMessage({
				_id: new Date().toISOString(), // fallback ID; the server ideally returns one
				sender,
				message,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Error sending message:", error);
		}
	},
}));
