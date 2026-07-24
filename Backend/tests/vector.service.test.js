const test = require('node:test');
const assert = require('node:assert/strict');
const memoryModel = require('../src/models/memory.model');
const { queryMemory } = require('../src/services/vector.service');

test('queryMemory returns the most relevant stored memory for the user', async () => {
  const memories = [
    {
      _id: 'm1',
      user: 'user-1',
      chat: 'chat-1',
      text: 'I prefer concise answers.',
      embedding: [1, 0],
      createdAt: new Date(),
    },
    {
      _id: 'm2',
      user: 'user-1',
      chat: 'chat-1',
      text: 'The capital of France is Paris.',
      embedding: [0, 1],
      createdAt: new Date(),
    },
  ];

  memoryModel.find = () => ({
    sort: () => ({
      limit: () => ({
        lean: async () => memories,
      }),
    }),
  });

  const result = await queryMemory({
    queryVector: [1, 0],
    limit: 5,
    metadata: { user: 'user-1' },
  });

  assert.ok(result.length > 0);
  assert.equal(result[0].metadata.text, 'I prefer concise answers.');
});
