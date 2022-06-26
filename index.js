const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config/key');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');

const User = require("./models/User");
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {useNewUrlParser: true}).then(() => console.log('mongoDB connected'));

app.use(bodyParser.urlencoded({extended : true})); // application/x-www-form-urlencoded 분석
app.use(bodyParser.json()); // application/json type 분석
app.use(cookieParser());
app.get('/',(req,res) => res.send('rottasdasot'));


app.post('/api/users/register', (req,res) => {
    const user = new User(req.body);
    user.save((err, userInfo) => {
        if(err) return res.json({success : false, err});
        return res.status(200).json({success: true});
    });
});

app.post('/api/users/login' , (req,res) => {
    // 1. DB안에서 요청된 email 찾기.
    User.findOne({email : req.body.email}, (err, user) => {
        
        if(!user) {
            return res.json({
                loginSuccess : false,
                message : "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        // 2. 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
        user.comparePassword(req.body.password , (err, isMatch) => {
            if(!isMatch)
                return res.json({
                    loginSuccess : false,
                    message : "비밀번호가 틀렸습니다."
                });
                // 3. 비밀번호 까지 맞다면 토큰을 생성. (jsonwebtoken lib)
                user.generateToken((err, user) => {
                    if(err) return res.status(400).send(err);
                    // 토큰을 저장한다. user_.id + secretToken(문자열) (쿠키 or 로컬스토리지 등.)
                    res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess : true, userId : user._id});
                });
        });
    });
});

app.get('/api/users/auth' , auth , (req, res) => {
    res.status(200).json({
        _id : req.user._id,
        isAdmin : req.user.role === 0 ? false : true,
        isAuth : true,
        email : req.user.email,
        name : req.user.name,
        lastname : req.user.lastname,
        role : req.user.role,
        image : req.user.image,
    });
});

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id : req.body._id}
                        , {token : ""}
                        , (err, user) => {
        if(err) 
            return res.json({ success : false , err});

        return res.status(200).send({ success: true });
    });
});


app.listen(3000, () => {
    console.log('server 3000 start');
});