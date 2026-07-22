                              +----------------------+
                              |      User Browser    |
                              |   (React + Vite UI)  |
                              +----------+-----------+
                                         |
                                 Socket.IO / HTTP
                                         |
                                         v
                              +----------------------+
                              |   Express.js Server  |
                              |      (Node.js)       |
                              +----------+-----------+
                                         |
             +---------------------------+---------------------------+
             |                           |                           |
             |                           |                           |
             v                           v                           v
   +------------------+        +-------------------+       +-------------------+
   | Authentication   |        |   AI Service      |       |   Chat Service    |
   | JWT + Cookies    |        | Gemini 2.5 Flash  |       | Message Handling  |
   +--------+---------+        +---------+---------+       +---------+---------+
            |                            |                           |
            |                            |                           |
            v                            |                           |
   +------------------+                  |                           |
   | MongoDB          |                  |                           |
   | Users & Chats    |                  |                           |
   +------------------+                  |                           |
                                         |                           |
                                         v                           |
                              +---------------------+                |
                              | Gemini Embeddings   |                |
                              +----------+----------+                |
                                         |                           |
                                         v                           |
                                  +-------------+                    |
                                  | Pinecone DB |<-------------------+
                                  | Vector Store|
                                  +-------------+

Data Flow 

User Prompt
      │
      ▼
React Frontend
      │
      ▼
Socket.IO / REST API
      │
      ▼
Express Backend
      │
      ├── Authenticate User (JWT)
      │
      ├── Store/Retrieve Chat (MongoDB)
      │
      ├── Generate Embedding
      │         │
      │         ▼
      │    Pinecone Search
      │         │
      │         ▼
      └── Context + Prompt
                │
                ▼
         Gemini 2.5 Flash API
                │
                ▼
        AI Response Generated
                │
                ▼
        Save Conversation
                │
                ▼
        Send Response to Client

                                  