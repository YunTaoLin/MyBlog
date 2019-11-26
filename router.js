const express = require('express')
let router = express.Router()
let showdown = require('showdown')
    //markdown 轉HTML
let converter = new showdown.Converter()

// 密碼加密
let md5 = require('blueimp-md5')

let User = require('./models/user', { useMongoClient: true })
let Comment = require('./models/comment.js', { useMongoClient: true })


//首頁
router.get('/', function(req, response) {
    Comment.find()
        .then(list => {
            if (list.length == 0) {
                return response.render('index.html', {
                    user: req.session.user
                })
            }
            let commentList = []
            for (let i = 0; i < list.length; i++) {
                User.findById(list[i].issuer)
                    .then(issuer => {
                        let time = list[i].create_time
                        let create_time = time.getMonth() + 1 + '/' + time.getDate() + '  ' + time.getHours() + ':' + time.getMinutes()

                        list[i].username = issuer.username
                        list[i].headimg = issuer.headimg
                        list[i].show_create_time = String(create_time)
                        list[i].theId = String(list[i]._id)

                        commentList.unshift(list[i])
                        if (i + 1 === list.length) {
                            response.render('index.html', {
                                user: req.session.user,
                                commentList: commentList
                            })
                        }
                    })
            }

        })
})




//渲染登入頁面
router.get('/login', function(req, res) {
    res.render('login.html')
})

//處理登入請求
router.post('/login', function(req, res) {
    var body = req.body
    body.password = md5(body.password)
    User.findOne({
        email: body.email,
        password: body.password
    }, (error, user) => {
        if (error) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        } else if (!user) {
            return res.status(200).json({
                err_code: 1,
                message: 'email or password error'
            })
        } else {
            //登入成功，使用Session紀錄登入狀態
            req.session.user = user
            res.json({
                err_code: 0,
                message: 'OK'
            })
        }
    })
})

//渲染註冊頁面
router.get('/register', function(req, res) {
    res.render('register.html')
})

//處理註冊請求
router.post('/register', function(req, res) {
    // 1.表單提交
    // req.body
    // 2.操作數據庫
    // 判斷用戶是否存在
    let body = req.body
    body.password = md5(body.password)
    User.findOne({
        $or: [{ email: body.email }, { username: body.username }]
    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        if (data) {
            //email或用戶名已存在
            //這邊有json方法，可以方便傳送json
            return res.status(200).json({
                err_code: 1,
                message: 'Email or username aleady exists'
            })
        }
        new User(body).save((err, user) => {
            if (err) {
                return res.status(500).json({
                    err_code: 500,
                    message: 'Internal error'
                })
            }
            //註冊成功，使用Session紀錄登入狀態
            req.session.user = user
            res.json({
                err_code: 0,
                message: 'OK'
            })
        })




    })
})

//處理登出
router.get('/logout', function(req, res) {
    req.session.user = null
    res.redirect('/login')
})

//渲染發文頁面
router.get('/post', function(req, res) {
    //如果沒登入，跳到登入頁面
    if (!req.session.user) {
        res.redirect('/login')
    }
    res.render('topic/post.html', {
        user: req.session.user
    })
})

//處理發文請求
router.post('/post', function(req, res) {
    let body = req.body
    console.log(body)
    new Comment(body).save((err, data) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: 'Internal error'
            })
        }
        res.json({
            err_code: 0,
            message: 'OK'
        })
    })
})

//渲染文章頁面
router.get('/article', function(req, res) {
    Comment.findById(req.query.id)
        .then((article) => {
            new Promise((res, rej) => {
                    User.findById(article.issuer)
                        .then((author) => { res({ article, author }) })
                })
                .then(({ article, author }) => {
                    let time = article.create_time
                    let create_time = time.toLocaleString()
                    console.log(author)
                    article.theTime = create_time
                    article.content = converter.makeHtml(article.content)
                    console.log(article.content)
                    res.render('topic/article.html', {
                        user: req.session.user,
                        article: article,
                        author: author
                    })
                })
        })




})


























module.exports = router