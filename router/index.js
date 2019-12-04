const express = require('express')
let router = express.Router()

//markdown 轉HTML
let showdown = require('showdown')
let converter = new showdown.Converter()

// 大頭照儲存
const multer = require('multer')

// 密碼加密
let md5 = require('blueimp-md5')

let User = require('../models/user', { useMongoClient: true })
let Comment = require('../models/comment.js', { useMongoClient: true })
let Reply = require('../models/reply.js', { useMongoClient: true })

let trans_time = require('../public/js/transTime')


//首頁
router.get('/', function(req, response) {
    //將跳轉需求初始化
    req.session.nowURL = null
    Comment.find()
        .then(list => {
            //判斷文章總數來切割分頁
            let pageArray = []
            for (let i = 1; i <= Math.ceil(list.length / 10); i++) {
                pageArray.push(i)
            }
            page = req.query.page || 1
            list = list.reverse().slice(page * 10 - 10, page * 10)
            if (list.length == 0) {
                return response.render('index.html', {
                    user: req.session.user
                })
            }
            let commentList = []
                //用遞迴的方進行處理非同步的疊代處理
            function myRender(i) {
                User.findById(list[i].issuer)
                    .then(issuer => {
                        let time = list[i].create_time
                        let create_time = trans_time(time)
                        list[i].username = issuer.username
                        list[i].headimg = issuer.headimg
                        list[i].show_create_time = String(create_time)
                        list[i].theId = String(list[i]._id)
                        Reply.find({ which_comment: list[i]._id })
                            .then(reply => {
                                list[i].reply = reply.length
                                commentList.push(list[i])
                                if (i + 1 === list.length) {
                                    return response.render('index.html', {
                                        user: req.session.user,
                                        commentList: commentList,
                                        pageArray: pageArray,
                                        nowPage: req.query.page || 1
                                    })
                                }
                                myRender(i + 1)
                            })
                    })
            }
            myRender(0)

        })
})




// 渲染搜尋頁面
router.get('/search', function(req, response) {
    //將跳轉需求初始化
    req.session.nowURL = null
    let search = req.query.search
    Comment.find()
        .then(list => {
            //判斷文章總數來切割分頁
            let pageArray = []
            let newList = list.filter(item => {
                    return item.title.toLowerCase().indexOf(search.toLowerCase()) != -1
                })
                //如果找不到，就直接渲染
            if (!newList.length) {
                return response.render('search.html', {
                    user: req.session.user,
                    search: search,
                    Find: false
                })
            }
            for (let i = 1; i <= Math.ceil(newList.length / 10); i++) {
                pageArray.push(i)
            }
            page = req.query.page || 1
            newList = newList.reverse().slice(page * 10 - 10, page * 10)
            if (list.length == 0) {
                return response.render('index.html', {
                    user: req.session.user
                })
            }
            let commentList = []
                //用遞迴的方進行處理非同步的疊代處理
            function myRender(i) {
                User.findById(newList[i].issuer)
                    .then(issuer => {
                        let time = newList[i].create_time
                        let create_time = trans_time(time)
                        newList[i].username = issuer.username
                        newList[i].headimg = issuer.headimg
                        newList[i].show_create_time = String(create_time)
                        newList[i].theId = String(newList[i]._id)
                        Reply.find({ which_comment: newList[i]._id })
                            .then(reply => {
                                newList[i].reply = reply.length
                                commentList.push(newList[i])
                                if (i + 1 === newList.length) {
                                    return response.render('search.html', {
                                        user: req.session.user,
                                        commentList: commentList,
                                        pageArray: pageArray,
                                        nowPage: req.query.page || 1,
                                        search: search
                                    })
                                }
                                myRender(i + 1)
                            })
                    })
            }
            myRender(0)

        })
})







module.exports = router