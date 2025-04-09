import useAuthStore from '@/stores/auth.store';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';

const Chat: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const token = accessToken;
  const sender = user
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const socketURL = import.meta.env.VITE_APP_BACKEND_URL;

  const { id } = useParams();

  useEffect(() => {
    if (id && id !== roomId) {
      setRoomId(id);
    }
  }, [id,roomId]);

  useEffect(() => {
    if (token && roomId) {
      const newSocket = io(socketURL, { auth: { token } });
      setSocket(newSocket);

      newSocket.on('connect_error', (err: { message: string }) => {
        console.error('Connection error:', err.message);
      });

      newSocket.on('connect', () => {
        console.log('Connected');
      });

      newSocket.on('message', (message: string) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      newSocket.on('error', (data: { message: string }) => {
        console.error('Socket error', data.message);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, roomId, socketURL]);

  const sendMessage = () => {
    if (socket && input.trim() && roomId && sender) {
      socket.emit('chatMessage', { roomId, message: input });
      setInput('');
    }
  };

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;