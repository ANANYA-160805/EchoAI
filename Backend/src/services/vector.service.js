// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create an index for dense vectors with integrated embedding
const echiaiIndex = pc.index('echo-ai'); 

async function createMemory({ vector, metadata, messageId }) {
  try {
    await echiaiIndex.upsert({
      records: [{
        id: String(messageId),
        values: vector,
        metadata
      }]
    });
    console.log("✅ Memory stored in Pinecone:", messageId);
  } catch (error) {
    console.error("❌ Pinecone Upsert Error:", error.message);
  }
}
async function queryMemory({ queryVector, limit = 5, metadata }) {
  try {
    const hasFilter = metadata && Object.keys(metadata).length > 0;

    const data = await echiaiIndex.query({
      vector: queryVector,
      topK: limit,
      filter: hasFilter ? metadata : undefined,
      includeMetadata: true
    });
    return data.matches;
  } catch (error) {
    console.error("❌ Pinecone Query Error:", error.message);
    return [];
  }
}

module.exports = {
    createMemory,
    queryMemory
}
