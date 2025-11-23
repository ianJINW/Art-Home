"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const socket_io_client_1 = require("socket.io-client");
const chat_1 = __importDefault(require("../../../../client/src/pages/chat"));
require("@testing-library/jest-dom");
jest.mock('socket.io-client');
describe('Chat Component', () => {
    let socket;
    beforeEach(() => {
        socket = { on: jest.fn(), emit: jest.fn() };
        jest.mocked(socket_io_client_1.io).mockReturnValue(socket);
        (0, react_1.render)((0, jsx_runtime_1.jsx)(chat_1.default, {}));
    });
    test('renders chat input', () => {
        const inputElement = react_1.screen.getByPlaceholderText(/type a message/i);
        expect(inputElement).toBeTruthy();
    });
    test('emits message on send', () => {
        const inputElement = react_1.screen.getByPlaceholderText(/type a message/i);
        const sendButton = react_1.screen.getByRole('button', { name: /send/i });
        react_1.fireEvent.change(inputElement, { target: { value: 'Hello' } });
        react_1.fireEvent.click(sendButton);
        expect(socket.emit).toHaveBeenCalledWith('chat message', 'Hello');
    });
});
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
        }));
    });
    test('shows chat interface when user is authenticated', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(chat_1.default, {}));
        expect(react_1.screen.queryByText(/please log in/i)).not.toBeTruthy();
        expect(react_1.screen.getByPlaceholderText(/type a message/i)).toBeTruthy();
    });
    test('shows login prompt when user is not authenticated', () => {
        jest.mock('@/stores/auth.store', () => ({
            __esModule: true,
            default: () => ({
                user: null
            })
        }));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(chat_1.default, {}));
        expect(react_1.screen.getByText(/please log in/i)).toBeTruthy();
    });
    test('displays username in sent messages', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            _id: 'test-user-id',
            username: 'testuser'
        };
        jest.mock('@/stores/auth.store', () => ({
            __esModule: true,
            default: () => ({
                user: mockUser
            })
        }));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(chat_1.default, {}));
        const input = react_1.screen.getByPlaceholderText(/type a message/i);
        const sendButton = react_1.screen.getByRole('button', { name: /send/i });
        react_1.fireEvent.change(input, { target: { value: 'Test message' } });
        react_1.fireEvent.click(sendButton);
        yield react_1.screen.findByText('You');
        expect(react_1.screen.getByText('Test message')).toBeTruthy();
    }));
    test('handles room joining with valid user', () => {
        const socket = { on: jest.fn(), emit: jest.fn() };
        jest.mocked(socket_io_client_1.io).mockReturnValue(socket);
        const mockUser = {
            _id: 'test-user-id',
            username: 'testuser'
        };
        const mockOtherUser = {
            _id: 'other-user-id',
            username: 'otheruser'
        };
        jest.mock('@/stores/auth.store', () => ({
            __esModule: true,
            default: () => ({
                user: mockUser
            })
        }));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(chat_1.default, {}));
        expect(socket.emit).toHaveBeenCalledWith('joinRoom', expect.any(String), [
            mockUser._id,
            mockOtherUser._id
        ]);
    });
    test('displays error when user is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.mock('@/stores/auth.store', () => ({
            __esModule: true,
            default: () => ({
                user: { _id: null, username: '' }
            })
        }));
        const consoleSpy = jest.spyOn(console, 'error');
        (0, react_1.render)((0, jsx_runtime_1.jsx)(chat_1.default, {}));
        expect(consoleSpy).toHaveBeenCalledWith('Invalid user IDs for joinRoom:', expect.any(String), expect.any(String));
    }));
    test('updates chat header with other user name', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            _id: 'test-user-id',
            username: 'testuser'
        };
        const mockOtherUser = {
            _id: 'other-user-id',
            username: 'otheruser'
        };
        jest.mock('@/stores/auth.store', () => ({
            __esModule: true,
            default: () => ({
                user: mockUser
            })
        }));
        jest.mock('@/utils/axios', () => ({
            get: jest.fn().mockResolvedValue({
                data: {
                    participants: [mockUser, mockOtherUser],
                    messages: []
                }
            })
        }));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(chat_1.default, {}));
        yield react_1.screen.findByText(mockOtherUser.username);
        expect(react_1.screen.getByText(mockOtherUser.username)).toBeTruthy();
    }));
});
