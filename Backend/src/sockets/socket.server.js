const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {});

    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || '');
        
        if (!cookies.token) {
            return next(new Error('Authentication error: No token provided'));
        }
        try{

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            
            const user = await userModel.findById(decoded.id);

            socket.user = user; // Attach user info to socket object

            next();
            
        }catch(err){
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
    });

    
}

module.exports = initSocketServer;