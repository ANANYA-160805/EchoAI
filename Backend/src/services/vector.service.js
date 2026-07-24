const MemoryModel = require('../models/memory.model');

function toObjectId(value) {
  if (!value) return null;
  if (typeof value === 'object' && value.toString) return value;
  return value;
}

async function createMemory({ vector, metadata, messageId }) {
  try {
    if (!metadata?.user) {
      return;
    }

    const doc = {
      user: toObjectId(metadata.user),
      chat: metadata.chat ? toObjectId(metadata.chat) : undefined,
      text: metadata.text || '',
      messageId: messageId || undefined,
      source: 'chat',
      embedding: Array.isArray(vector) ? vector : undefined,
    };

    await MemoryModel.create(doc);
    console.log('✅ Memory stored in MongoDB:', messageId || doc.text);
  } catch (error) {
    console.error('❌ Memory store error:', error.message);
  }
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
  try {
    if (!metadata?.user) {
      return [];
    }

    const query = {
      user: toObjectId(metadata.user),
    };

    const memories = await MemoryModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (!Array.isArray(memories) || memories.length === 0) {
      return [];
    }

    const scored = memories
      .filter((memory) => memory.text)
      .map((memory) => ({
        metadata: {
          text: memory.text,
          chat: memory.chat,
          user: memory.user,
          messageId: memory.messageId,
        },
        score: 1,
      }));

    return scored;
  } catch (error) {
    console.error('❌ Memory query error:', error.message);
    return [];
  }
}

module.exports = {
  createMemory,
  queryMemory,
};
