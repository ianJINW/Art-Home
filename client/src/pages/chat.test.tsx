import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import io from 'socket.io-client'
import Chat from './chat'
import api from '@/utils/axios'

jest.mock('socket.io-client')
jest.mock('@/utils/axios')

describe('Chat Component', () => {
  let socket: any

  beforeEach(() => {
    socket = { on: jest.fn(), emit: jest.fn(), disconnect: jest.fn() }
    ;(io as unknown as jest.Mock).mockReturnValue(socket)
    ;(api.get as jest.Mock).mockResolvedValue({
      data: { messages: [] }
    })
    ;(api.post as jest.Mock).mockResolvedValue({
      data: {
        messages: [
          {
            sender: { username: 'me' },
            message: 'Hello',
            timestamp: new Date().toISOString()
          }
        ]
      }
    })
    render(<Chat />)
  })

  test('renders chat input', () => {
    const inputElement = screen.getByPlaceholderText(/type a message/i)
    expect(inputElement).toBeInTheDocument()
  })

  test('updates messages on socket "message" event', async () => {
    // Simulate receiving a message from the socket
    const messageHandler = socket.on.mock.calls.find(
      ([event]) => event === 'message'
    )[1]
    messageHandler({
      sender: { username: 'other' },
      message: 'Hi!',
      timestamp: new Date().toISOString()
    })

    // Wait for the message to appear in the DOM
    await waitFor(() => {
      expect(screen.getByText(/Hi!/)).toBeInTheDocument()
    })
  })

  test('sends message via HTTP POST and updates messages', async () => {
    const inputElement = screen.getByPlaceholderText(/type a message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })

    fireEvent.change(inputElement, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled()
      expect(screen.getByText(/Hello/)).toBeInTheDocument()
    })
  })
})
