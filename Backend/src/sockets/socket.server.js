const { Server } = require('socket.io');

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {});

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
    });

    return io;
}

module.exports = initSocketServer;