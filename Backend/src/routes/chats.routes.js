const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

/* POST /api/chats/ */
router.post('/', authMiddleware.authUser, chatController.createChat);

/* GET /api/chats/ */
router.get('/',authMiddleware.authUser, chatController.getChats);

/* GET /api/chats/messages/:id */
router.get('/messages/:id', authMiddleware.authUser, chatController.getMessages);

module.exports = router;