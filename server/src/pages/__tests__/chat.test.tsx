import { render, screen } from '@testing-library/react';
import { io } from 'socket.io-client';
import Chat from '../Chat';

jest.mock('socket.io-client');

describe('Chat Component', () => {
	let socket;

	beforeEach(() => {
		socket = { on: jest.fn(), emit: jest.fn() };
		io.mockReturnValue(socket);
		render(<Chat />);
	});

	test('renders chat input', () => {
		const inputElement = screen.getByPlaceholderText(/type a message/i);
		expect(inputElement).toBeInTheDocument();
	});

	test('emits message on send', () => {
		const inputElement = screen.getByPlaceholderText(/type a message/i);
		const sendButton = screen.getByRole('button', { name: /send/i });

		inputElement.value = 'Hello';
		sendButton.click();

		expect(socket.emit).toHaveBeenCalledWith('chat message', 'Hello');
	});
});