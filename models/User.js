const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; // 10자리 salt
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name : { type : String, maxlength : 50},
    email : { type : String, trim : true, unique : 1},
    password : { type : String,  maxlength : 100},
    lastname : String,
    role : { type : Number, default : 0},
    image :  String,
    token : {type: String},
    tokenExp : {type: Number},
});

// user model에서 user 정보를 저장하기전 수행하는 미들웨어
userSchema.pre('save',function(next) {
    // 비밀번호를 암호화 시킨다.
    var user = this;
    // 패스워드 변환될때만 bcrypt 이용하여 비밀번호를 암호화한다. 
    if(user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                console.log(user.password);
                next()
            });
        });
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, callback ) {
    // 입력된 비밀번호를 암호화 시킨후 DB상 암호화된 비밀번호와 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return callback(err);
        // callback : 에러가 없고 비밀번호가 같으면 -> true 반환 
        callback(null, isMatch);
    });
};

userSchema.methods.generateToken = function(callback) {
    var user = this;
    //jsonwebtoken을 이용해서 token 생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken'); //user._id + '문자열' = token 생성
    user.token = token;
    user.save( function(err,user) {
        if(err) 
            return callback(err);
        callback(null, user);
    });
}

userSchema.statics.findByToken = function (token, callback) {
    var user = this;
    // 토큰을 decode 한다.
    jwt.verify(token, "secretToken", function(err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은후 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({_id : decoded, "token" : token}, function(err, user){
            if(err) callback(err);
            callback(null, user);
        });
    });
}

const User = mongoose.model('User',userSchema);
module.exports = User;