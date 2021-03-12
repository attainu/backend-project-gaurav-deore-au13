const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5678;
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('../config/db');
const exphbs = require('express-handlebars');
const session = require('express-session');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname,'../public')));

app.engine('hbs', exphbs({
    extname: '.hbs'
}));
app.set("view engine", "hbs");

app.get('/', (req,res)=>{
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/forgot', (req,res)=>{
    res.render('forgot');
});

app.get('/logout',function(req,res){    
    res.redirect('/login');
});

app.get('/add',function(req,res){    
    res.render('add');
});


const authController = require('../routes/authController');
app.use('/api', authController);

app.get('/health', (req,res)=>{
    res.send("health is ok");
});

app.listen(PORT,()=>{
    console.log("server is running at port "+ PORT);
});