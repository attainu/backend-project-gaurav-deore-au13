const express = require('express');
const app = express();
const PORT = process.env.PORT || 5678;

app.get('/', (req,res)=>{
    res.send("server is running fine");
});

app.listen(PORT,()=>{
    console.log("server is running at "+ PORT);
});