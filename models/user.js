var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const User = mongoose.model('User', {
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    create_time: {
        type: Date,
        //注意 這裡不要寫Data.now()，不然時間就寫死了
        //這裡給的是一個方法，如果沒有傳遞參數，才會執行
        default: Date.now
    },
    last_modified_time: {
        type: Date,
        //注意 這裡不要寫Data.now()，不然時間就寫死了
        //這裡給的是一個方法，如果沒有傳遞參數，才會執行
        default: Date.now
    },
    headimg: {
        type: String,
        default: '/public/img/head.jpg'
    },
    bio: {
        type: String,
        default: '我是個有為青年'
    },
    gender: {
        type: Number,
        enum: [0, 1, -1],
        default: -1
    },
    otherEmail: {
        type: String
    },
    status: {
        type: Number,
        default: 0,
        //0: 正常，1:不能發文，2:封鎖帳號中
        enum: [0, 1, 2]
    },
    github: {
        type: String
    },
    fb: {
        type: String
    },
    twitter: {
        type: String
    },
    phone: {
        type: String
    },
    //按過讚的文章
    like: {
        type: Array
    }

})

module.exports = User