//Import Modules
const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route/route.js');
const mongoose = require('mongoose');


const app = express();


app.use(bodyParser.json());


  
//Connecting Data-Base
mongoose.connect("mongodb+srv://Abhilasha-93:jasta1234@cluster0.vl2c0ns.mongodb.net/group2Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))
     
    
app.use('/', route)
 
//Connecting on port
app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
