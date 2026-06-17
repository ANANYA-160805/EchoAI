const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const aiService = require('../services/ai.service');

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {});

    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || '');
        
        if (!cookies.token) {
            return next(new Error('Authentication error: No token provided'));
        }
        try{

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            
            const user = await userModel.findById(decoded.Id);

            socket.user = user; // Attach user info to socket object

            next();
            
        }catch(err){
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {

        socket.on("ai-message", async (messagePayload) => {
            console.log("Received  message from client:", messagePayload);
/* 
messagePayload should contain:
{
    content: "User's message to AI",
    chat: "Chat ID or context"
}
*/
            const response = await aiService.generateResponse(messagePayload.content);

            socket.emit("ai-response", {
                 content: response,
                 chat: messagePayload.chat
                 

             });
        });

    });

    
}

module.exports = initSocketServer;