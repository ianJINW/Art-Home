import React from 'react';
import { MessageCircle } from 'lucide-react';
import { GetData } from '@/utils/api';
import { Link } from 'react-router-dom';

const Chats: React.FC = () => {
  const { data, isPending, isError, error } = GetData("chat");

  if (isPending) {
    return <div>Loading chats...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message || "Failed to load chats."}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No chats available.</div>;
  }

  return (
    <div>
      <h1>Chats</h1>
      <ul>
        {Array.isArray(data) && data.map((chat: { id: string; name: string }) => (
          <li key={chat.id} style={{ display: 'flex', background: 'black', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={20} />
            <Link to={`/chat/${chat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {chat.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chats;