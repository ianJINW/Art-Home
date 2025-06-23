interface Message {
  sender:
    | {
        _id: string
        username: string
        email: string
      }
    | string
  content: string
  timestamp: string
  chatRoom?: {
    _id: string
    participants: string[]
  }
}

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import io, { Socket } from 'socket.io-client'
import useAuthStore from '@/stores/auth.store'
import api from '@/utils/axios'

const SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL!

const Chat: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>()
  type User = { _id: string; username: string }
  const user = useAuthStore(state => state.user) as User | null

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatHeader, setChatHeader] = useState('Chat')
  const [otherUserId, setOtherUserId] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!roomId || !user) return

    api
      .get<{
        messages: Message[]
        participants: { _id: string; username: string }[]
      }>(`/chat/${roomId}`)
      .then(
        (res: {
          data: {
            messages: Message[]
            participants: { _id: string; username: string }[]
          }
        }) => {
          setMessages(res.data.messages)

          if (res.data.participants) {
            const otherUser = res.data.participants.find(
              (p: { _id: string }) => p._id !== user?._id
            )
            if (otherUser) {
              setOtherUserId(otherUser._id)
              setChatHeader(otherUser.username)
            }
          }
          console.log(res.data, 'Debugging like ')
          console.log(
            'user._id:',
            user?._id,
            'participants:',
            res.data.participants
          )

          if (res.data.messages.length) {
            const first = res.data.messages[0]
            const other =
              typeof first.sender === 'object'
                ? first.sender.username
                : first.sender
            setChatHeader(other)
          }
        }
      )
      .catch((err: unknown) => {
        console.error('❌ Error fetching chat history:', err)
        setChatHeader('Chat')
      })
  }, [roomId, user])

  useEffect(() => {
    if (!roomId || !user || !otherUserId) return

    const socket = io(SOCKET_URL, {
      transportOptions: {
        polling: { withCredentials: true }
      }
    })

    socketRef.current = socket

    socket.on('connect', () => {
      if (
        typeof user._id === 'string' &&
        typeof otherUserId === 'string' &&
        user._id !== otherUserId
      ) {
        console.log('Joining room', roomId, [user._id, otherUserId])
        socket.emit('joinRoom', roomId, [user._id, otherUserId])
      } else {
        console.error('Invalid user IDs for joinRoom:', user._id, otherUserId)
      }
    })

    // Listen for real-time messages
    socket.on('message', (newMsg: Message) => {
      setMessages(prev => [...prev, newMsg])
    })

    socket.on('disconnect', reason => {
      console.log('❌ Disconnected:', reason)
    })

    return () => {
      socket.disconnect()
    }
  }, [roomId, user, otherUserId])

  // Scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send a message (HTTP + Socket)
  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !roomId) return

    try {
      const res = await api.post<{ message: Message; messages: Message[] }>(
        `/chat/${roomId}`,
        { message: text }
      )
      setMessages(res.data.messages)
      setInput('')

      // 2. Emit via Socket.IO for real-time update to others
      socketRef.current?.emit('chatMessage', {
        roomId,
        sender: user?._id,
        content: text
      })
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
    <div className='max-w-4xl mx-auto p-4 flex flex-col'>
      <h1 className='text-2xl font-bold mb-4'>{chatHeader}</h1>

      <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow mb-4 h-96 overflow-y-auto flex flex-col'>
        {messages.map((msg, i) => {
          const senderName =
            typeof msg.sender === 'object' ? msg.sender.username : msg.sender
          const isOwn = senderName === user.username
          return (
            <div
              key={i}
              className={`mb-2 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                  isOwn
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-300 text-black rounded-bl-none'
                }`}
              >
                <strong className='block text-sm mb-1'>
                  {isOwn ? 'You' : senderName}
                </strong>
                {msg.content}
                <div className='text-xs text-gray-500 dark:text-gray-400 mt-1 text-right'>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )
        })}

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
