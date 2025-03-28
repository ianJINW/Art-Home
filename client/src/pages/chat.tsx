import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const socketURL = import.meta.env.VITE_APP_BACKEND_URL;

  useEffect(() => {
    const newSocket = io(socketURL);
    setSocket(newSocket);

    newSocket.on('message', (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [socketURL]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit('message', input);
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