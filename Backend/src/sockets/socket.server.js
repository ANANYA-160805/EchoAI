const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const aiService = require('../services/ai.service');
const messageModel = require('../models/message.model');
const { createMemory, queryMemory } = require('../services/vector.service');

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
    console.log("Received message from client:", messagePayload);

    
    if (!messagePayload.content || !messagePayload.chat) {
        socket.emit("ai-response", { error: "Invalid message payload" });
        return;
    }

    try {
        
        await messageModel.create({
            user: socket.user._id,
            chat: messagePayload.chat,
            content: messagePayload.content, 
            role: "user"
        });


       const chatHistory = await messageModel.find({
           chat: messagePayload.chat
         }).sort({ createdAt: -1 }).limit(20).lean();

         // Reverse the array in JavaScript
           chatHistory.reverse(); // Get last 20 messages in chronological order


      
        const response = await aiService.generateResponse( chatHistory.map(item => ({
             role: item.role,
             parts : [{ text: item.content }]
             })));  

        // Validate response
        if (!response || response.trim() === '') {
            throw new Error('AI returned empty response');
        }

        // Create model message
        await messageModel.create({
            chat: messagePayload.chat,
            content: response,
            user: socket.user._id,
            role: "model"
        });

        // Emit response to client
        socket.emit("ai-response", {
            content: response,
            chat: messagePayload.chat
        });

    } catch (err) {
        console.error(err);
        socket.emit("ai-response", {
            error: err.message || "Failed to generate response"
        });
    }
});
});

    
}

module.exports = initSocketServer;