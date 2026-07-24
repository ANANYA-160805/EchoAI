const chatModel = require('../models/chat.model');

async function createChat(req, res) {

    const { title } = req.body;
    const user= req.user;

    const chat = await chatModel.create({
        user: user._id,
        title
    });
    res.status(201).json({
        message: "Chat created successfully",
        chat: {
            id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user:chat.user
        }
    })
}

async function getChats(req, res) {
    const user= req.user;

    const chats = await chatModel.find({ user: user._id }).sort({ lastActivity: -1 });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    })
}

module.exports = { 
    createChat 
, getChats
};
    