import { render, screen, fireEvent } from '@testing-library/react'
import { io } from 'socket.io-client'
import Chat from '../../../../client/src/pages/chat'
import '@testing-library/jest-dom'

jest.mock('socket.io-client')

describe('Chat Component', () => {
  interface MockSocket {
    on: jest.Mock
    emit: jest.Mock
  }

  let socket: MockSocket

  beforeEach(() => {
    socket = { on: jest.fn(), emit: jest.fn() }
    ;(jest.mocked(io) as jest.Mock).mockReturnValue(socket)
    render(<Chat />)
  })

  test('renders chat input', () => {
    const inputElement = screen.getByPlaceholderText(/type a message/i)
    expect(inputElement).toBeTruthy()
  })

  test('emits message on send', () => {
    const inputElement = screen.getByPlaceholderText(/type a message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })

    fireEvent.change(inputElement, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)

    expect(socket.emit).toHaveBeenCalledWith('chat message', 'Hello')
  })
})
describe('User Authentication and State', () => {
  beforeEach(() => {
    // Mock useAuthStore hook
    jest.mock('@/stores/auth.store', () => ({
      __esModule: true,
      default: () => ({
        user: {
          _id: 'test-user-id',
          username: 'testuser'
        }
      })
    }))
  })

  test('shows chat interface when user is authenticated', () => {
    render(<Chat />)
    expect(screen.queryByText(/please log in/i)).not.toBeTruthy()
    expect(screen.getByPlaceholderText(/type a message/i)).toBeTruthy()
  })

  test('shows login prompt when user is not authenticated', () => {
    jest.mock('@/stores/auth.store', () => ({
      __esModule: true,
      default: () => ({
        user: null
      })
    }))
    render(<Chat />)
    expect(screen.getByText(/please log in/i)).toBeTruthy()
  })

  test('displays username in sent messages', async () => {
    const mockUser = {
      _id: 'test-user-id',
      username: 'testuser'
    }

    jest.mock('@/stores/auth.store', () => ({
      __esModule: true,
      default: () => ({
        user: mockUser
      })
    }))

    render(<Chat />)
    const input = screen.getByPlaceholderText(/type a message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await screen.findByText('You')
    expect(screen.getByText('Test message')).toBeTruthy()
  })

  test('handles room joining with valid user', () => {
    const socket = { on: jest.fn(), emit: jest.fn() }
    ;(jest.mocked(io) as jest.Mock).mockReturnValue(socket)

    const mockUser = {
      _id: 'test-user-id',
      username: 'testuser'
    }
    const mockOtherUser = {
      _id: 'other-user-id',
      username: 'otheruser'
    }

    jest.mock('@/stores/auth.store', () => ({
      __esModule: true,
      default: () => ({
        user: mockUser
      })
    }))

    render(<Chat />)
    expect(socket.emit).toHaveBeenCalledWith('joinRoom', expect.any(String), [
      mockUser._id,
      mockOtherUser._id
    ])
  })

  test('displays error when user is invalid', async () => {
    jest.mock('@/stores/auth.store', () => ({
      __esModule: true,
      default: () => ({
        user: { _id: null, username: '' }
      })
    }))

    const consoleSpy = jest.spyOn(console, 'error')
    render(<Chat />)

    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid user IDs for joinRoom:',
      expect.any(String),
      expect.any(String)
    )
  })

  test('updates chat header with other user name', async () => {
    const mockUser = {
      _id: 'test-user-id',
      username: 'testuser'
    }
    const mockOtherUser = {
      _id: 'other-user-id',
      username: 'otheruser'
    }

    jest.mock('@/stores/auth.store', () => ({
      __esModule: true,
      default: () => ({
        user: mockUser
      })
    }))

    jest.mock('@/utils/axios', () => ({
      get: jest.fn().mockResolvedValue({
        data: {
          participants: [mockUser, mockOtherUser],
          messages: []
        }
      })
    }))

    render(<Chat />)
    await screen.findByText(mockOtherUser.username)
    expect(screen.getByText(mockOtherUser.username)).toBeTruthy()
  })
})
