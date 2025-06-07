const io = require('socket.io-client');
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const ioServer = new Server(server);

ioServer.on('connection', (socket) => {
	socket.on('message', (msg) => {
		socket.emit('message', msg);
	});
});

server.listen(3000);

test('socket.io connection', (done) => {
	const client = io('http://localhost:3000');
	client.on('connect', () => {
		expect(client.connected).toBe(true);
		client.disconnect();
		done();
	});
});

test('message event', (done) => {
	const client = io('http://localhost:3000');
	client.on('message', (msg) => {
		expect(msg).toBe('Hello');
		client.disconnect();
		done();
	});
	client.emit('message', 'Hello');
});