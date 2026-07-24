const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');

async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title,
  });

  res.status(201).json({
    message: 'Chat created successfully',
    chat: {
      id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    },
  });
}

async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({ user: user._id }).sort({ lastActivity: -1 });

  res.status(200).json({
    message: 'Chats retrieved successfully',
    chats: chats.map((chat) => ({
      id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    })),
  });
}

async function getMessages(req, res) {
  const chatId = req.params.id;
  const user = req.user;

  const chat = await chatModel.findOne({ _id: chatId, user: user._id });
  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 }); 

  res.status(200).json({
    message: 'Messages retrieved successfully',
    messages: messages.map((message) => ({
      id: message._id,
      role: message.role,       
      content: message.content,
      createdAt: message.createdAt,
    })),
  });
}

module.exports = {
  createChat,
  getChats,
  getMessages,
};