// src/components/Chat.tsx

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import io, { Socket } from 'socket.io-client'
import useAuthStore from '@/stores/auth.store'
import api from '@/utils/axios'

const SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL!

interface Message {
  sender: { username: string } | string
  message: string
  timestamp: string
}

const Chat: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>()
  const user = useAuthStore(state => state.user)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatHeader, setChatHeader] = useState('Chat')
  const socketRef = useRef<typeof Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch history
  useEffect(() => {
    if (!roomId) return

    api
      .get<{ messages: Message[] }>(`/chat/${roomId}`)
      .then(res => {
        setMessages(res.data.messages)
        if (res.data.messages.length) {
          const first = res.data.messages[0]
          const other =
            typeof first.sender === 'object'
              ? first.sender.username
              : first.sender
          setChatHeader(other)
        }
      })
      .catch(err => {
        console.error('❌ Error fetching chat history:', err)
        setChatHeader('Chat')
      })
  }, [roomId])

  // Socket.IO connection
  useEffect(() => {
    if (!roomId || !user) return

    const socket = io(SOCKET_URL, {
      auth: {
        token:
          /* we’re now using HTTP-only cookie, so omit this or leave empty */ {}
      },
      // move withCredentials under transportOptions.polling:
      transportOptions: {
        polling: {
          withCredentials: true
        }
      }
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔌 Connected, joining room', roomId)
      socket.emit('joinRoom', roomId)
    })

    socket.on('message', (newMsg: Message) => {
      setMessages(prev => [...prev, newMsg])
    })

    socket.on('disconnect', reason => {
      console.log('❌ Disconnected:', reason)
    })

    return () => {
      socket.disconnect()
    }
  }, [roomId, user])

  // Scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send a message
  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !roomId) return

    try {
      const { data } = await api.post<{ messages: Message[] }>(
        `/chat/${roomId}`,
        { message: text }
      )
      setMessages(data.messages)
      setInput('')
    } catch (err) {
      console.error('❌ Error sending message:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  if (!user) {
    return <p className='text-center p-4'>Please log in to join the chat.</p>
  }

  return (
    <div className='max-w-4xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>{chatHeader}</h1>

      <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow mb-4 h-96 overflow-y-auto'>
        {messages.map((msg, i) => (
          <div key={i} className='mb-2'>
            <strong>
              {typeof msg.sender === 'object'
                ? msg.sender.username
                : msg.sender}
              :
            </strong>{' '}
            {msg.message}{' '}
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className='flex gap-2'>
        <input
          type='text'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type a message'
          className='flex-1 p-2 border rounded-lg'
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className='px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50'
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
