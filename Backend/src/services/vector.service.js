// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create an index for dense vectors with integrated embedding
const echiaiIndex = pc.Index('ech-ai');

async function createMemory(vector, metadata,messageId) {

    await echiaiIndex.upsert([{
        id: messageId,
        values: vector,
        metadata
    }])
}

async function queryMemory({queryVector, limit = 5,metadata }) {


    const data = await echiaiIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? {metadata} : undefined,
        includeMetadata: true
    });

    return data.matches;
}

module.exports = {
    createMemory,
    queryMemory
}
