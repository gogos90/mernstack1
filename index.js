const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config/key');


const User = require("./models/User");
const mongoose = require('mongoose');
const db_uri = "";
mongoose.connect(config.mongoURI, {useNewUrlParser: true}).then(() => console.log('mongoDB connected'));


app.use(bodyParser.urlencoded({extended : true})); // application/x-www-form-urlencoded 분석
app.use(bodyParser.json()); // application/json type 분석

app.get('/',(req,res) => res.send('rottasdasot'));

app.post('/register', (req,res) => {
    const user = new User(req.body);
    user.save((err, userInfo) => {
        if(err) 
            return res.json({success : false, err});
        return res.status(200).json({success: true});
    });
});

app.listen(3000, () => {
    console.log('server 3000 start');
});