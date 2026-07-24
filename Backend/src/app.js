const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

/* Routes */
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chats.routes');

const app = express();

/* Using Middleware */
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// Serve static assets from 'dist'
app.use(express.static(path.join(__dirname, '../Public')));

/* Routes */
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// Catch-all route to serve index.html for SPA frontend
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, '../Public/index.html'));
});

module.exports = app;