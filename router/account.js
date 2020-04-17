const express = require('express')
let router = express.Router()

//markdown 轉HTML
let showdown = require('showdown')

// 密碼加密
let md5 = require('blueimp-md5')

let User = require('../models/user', { useMongoClient: true })



//渲染登入頁面
router.get('/login', function(req, res) {
    // 如果登入了就導到首頁
    if (req.session.user) {
        res.redirect('/')
    }
    res.render('login.html', {
        to: req.session.nowURL
    })
    req.session.nowURL = null

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
    // 如果登入了就導到首頁
    if (req.session.user) {
        res.redirect('/')
    }
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


module.exports = router