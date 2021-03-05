const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://redatlas:red123456@cluster0.tib10.mongodb.net/attainraman?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log("Connected to Database");
}).catch(err => {
    console.log("cannot conect, something is error");
    process.exit();
});


