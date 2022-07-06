//import packages here
const express = require ('express')
const bodyparser = require ('body-parser')
const mongoose = require ('mongoose')
const route = require ('./route/route.js')
const app = express();

app.use(bodyparser.json());

//connected nodejs to mongoDb here
mongoose.connect("mongodb+srv://Abhilasha-93:jasta1234@cluster0.vl2c0ns.mongodb.net/group2Database?retryWrites=true&w=majority",
    {useNewUrlParser :true})
    
.then(()=>console.log("mongoDb is connect"))
.catch (err=>console.log(err.msg));

app.use('/',route);

//providing port of URL here
app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
