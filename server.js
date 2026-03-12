const app = require('./src/app');
require('dotenv').config();
const connectDb = require('./src/config/db');
const dns = require('dns');
dns.setServers(["1.1.1.1","8.8.8.8"]);
connectDb();
app.listen(3000,()=>{
    console.log("server is running now...")
})