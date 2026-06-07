require('dotenv').config();
const server = require('./src/app');
const connectDB = require('./src/db/db');

connectDB();


server.listen(3000,()=>{
    console.log("Server is running on port 3000");
})