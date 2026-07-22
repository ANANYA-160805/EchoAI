const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

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

/* Using Routes */
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

module.exports = app;