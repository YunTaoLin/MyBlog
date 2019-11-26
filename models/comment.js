var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const Comment = mongoose.model('Comment', {
    //發文者ID
    issuer: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    //文章內容
    content: {
        type: String,
        required: true
    },
    //大分類
    classify: {
        type: String,
        required: true
    },
    //子分類
    issue: {
        type: String,
        required: true
    },
    create_time: {
        type: Date,
        //注意 這裡不要寫Data.now()，不然時間就寫死了
        //這裡給的是一個方法，如果沒有傳遞參數，才會執行
        default: Date.now
    },
    //最後編輯時間
    last_modified_time: {
        type: Date,
        //注意 這裡不要寫Data.now()，不然時間就寫死了
        //這裡給的是一個方法，如果沒有傳遞參數，才會執行
        default: Date.now
    },
    //點擊次數
    seen: {
        type: Number,
        default: 0
    },
    //擁有幾個讚
    good: {
        type: Number,
        default: 0
    },
    //文章訂閱者
    subscribe: {
        type: Array,
        default: []
    },
    //文章回覆數量
    reply: {
        type: Number,
        default: 0
    },
    //當前備註(當有人回覆時可能更新)
    status: {
        type: String,
        default: '快來參與討論吧'
    }

})

module.exports = Comment