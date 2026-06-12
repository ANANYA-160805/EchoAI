require('dotenv').config();
const server = require('./src/app');
const connectDB = require('./src/db/db');
const initSocketServer = require('./src/sockets/socket.server');
const httpServer = require('http').createServer(server);

initSocketServer(httpServer);

connectDB();


httpServer.listen(3000,()=>{
    console.log("Server is running on port 3000");
})