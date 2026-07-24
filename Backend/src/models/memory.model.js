const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
  text: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
  },
  source: {
    type: String,
    default: 'chat',
  },
  embedding: {
    type: [Number],
    default: undefined,
  },
}, {
  timestamps: true,
});

const MemoryModel = mongoose.model('Memory', memorySchema);

module.exports = MemoryModel;
