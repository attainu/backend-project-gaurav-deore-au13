const express = require('express');
const app = express();
const PORT = process.env.PORT || 5678;
const cors = require('cors');
const db = require('../config/db');

app.use(cors());

const authController = require('../routes/authController');
app.use('/api', authController);

app.get('/health', (req,res)=>{
    res.send("health is ok");
});

app.listen(PORT,()=>{
    console.log("server is running at port "+ PORT);
});