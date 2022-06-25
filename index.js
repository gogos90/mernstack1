const express = require('express');
const app = express();

const User = require("./models/User");
const mongoose = require('mongoose');
const db_uri = "mongodb://localhost:27017/yongbin";
mongoose.connect(db_uri, {useNewUrlParser: true}).then(() => console.log('mongoDB connected'));

app.get('/',(req,res) => res.send('root'));

app.listen(3000, () => {
    console.log('server 3000 start');
});