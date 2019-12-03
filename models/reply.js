var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const User = mongoose.model('Reply', {
    // 我是哪篇文章的回覆
    which_comment: {
        type: String,
        required: true
    },
    // 我是誰留言的
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    // 我的創立時間
    create_time: {
        type: Date,
        default: Date.now
    },
    // 誰(ID)按過我的讚
    like: {
        type: Array
    }
})

module.exports = User